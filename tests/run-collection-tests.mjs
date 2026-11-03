import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { build } from "esbuild";
import { getTableName } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const dialect = new PgDialect();
const productA = "00000000-0000-4000-8000-000000000001";
const productB = "00000000-0000-4000-8000-000000000002";
const collectionId = "00000000-0000-4000-8000-000000000010";
const draft = { name: "Aarambh", slug: "aarambh", image: "https://example.com/cover.jpg", productIds: [productA, productB], isActive: true, isComingSoon: false };
const row = { ...draft, id: collectionId, label: "Summer 2026", tagline: "Our debut collection", description: "Made in Jaipur", sortOrder: 0 };
const piece = id => ({ id, slug: `piece-${id}`, name: "Test piece", pricingConfig: [{ size: "s", basePrice: 1000, isVisible: true }], variants: [{ id: `${id}-variant`, color: "Gold", bannerImage: "/cover.jpg", images: [] }] });

async function load(entry) {
  const result = await build({
    entryPoints: [entry], bundle: true, write: false, platform: "node", format: "cjs", packages: "external",
    plugins: [{ name: "collection-fixtures", setup(build) {
      const fixtures = {
        "@/lib/db": "export const db = new Proxy({}, { get: (_, key) => globalThis.collectionDb[key] });",
        "@/lib/auth/admin": "export async function getOrderAdmin() { return globalThis.collectionAdmin ? { id: 'admin' } : null; } export async function requireAdmin() { if (!globalThis.collectionAdmin) throw new Error('Admin sign-in is required.'); }",
        "next/cache": "export function revalidatePath(...args) { globalThis.collectionRefreshes.push(args); }",
        "@/lib/productCatalog": "export async function loadCatalog(where) { globalThis.catalogPredicates.push(where); return globalThis.collectionCatalog; }",
        "next/link": "import React from 'react'; export default function Link({children, ...props}) { return React.createElement('a', props, children); }",
        "@/components/ProductCard": "import React from 'react'; import { productHref } from '@/lib/productAdapter'; export default function ProductCard({product}) { return React.createElement('a', { href: productHref(product), 'data-product': product.id }, product.name); }",
        "next/navigation": "export function notFound() { throw new Error('NOT_FOUND'); } export function redirect(url) { throw new Error('REDIRECT:' + url); }",
      };
      // Also match relative imports of the same server dependencies.
      build.onResolve({ filter: /^(?:@\/lib\/(?:db|auth\/admin|productCatalog)|\.\/(?:db|auth\/admin|productCatalog)|next\/(?:cache|link|navigation)|@\/components\/ProductCard)$/ }, args => ({ path: args.path.startsWith('./') ? '@/lib/' + args.path.slice(2) : args.path, namespace: 'fixture' }));
      build.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ contents: fixtures[args.path], loader: 'js', resolveDir: process.cwd() }));
    } }],
  });
  const module = { exports: {} };
  new Function("require", "module", "exports", result.outputFiles[0].text)((id) => id === "react" ? { ...require(id), cache: fn => fn } : require(id), module, module.exports);
  return module.exports;
}

let selects, writes;
function fakeDb(results = []) {
  selects = []; writes = [];
  const db = {
    select(fields) {
      const query = { fields, table: null, where: null };
      selects.push(query);
      const chain = {
        from(table) { query.table = getTableName(table); return chain; },
        where(predicate) { query.where = predicate; return chain; },
        orderBy(...order) { query.order = order; return chain; }, limit() { return chain; },
        then(resolve, reject) { return Promise.resolve().then(() => {
          const value = results.shift() ?? [];
          if (value instanceof Error) throw value;
          return value;
        }).then(resolve, reject); },
      };
      return chain;
    },
    insert(table) { return { values(value) { writes.push({ op: 'insert', table: getTableName(table), value }); return { returning: async () => [row], then: resolve => Promise.resolve([]).then(resolve) }; } }; },
    update(table) { return { set(value) { return { where() { writes.push({ op: 'update', table: getTableName(table), value }); return { returning: async () => [row] }; } }; } }; },
    delete(table) { return { where() { writes.push({ op: 'delete', table: getTableName(table) }); return { returning: async () => [row], then: resolve => Promise.resolve([]).then(resolve) }; } }; },
    async transaction(callback) { const checkpoint = writes.length; try { return await callback(db); } catch (error) { writes.splice(checkpoint); throw error; } },
  };
  globalThis.collectionDb = db;
}
function predicate(index) { return dialect.sqlToQuery(selects[index].where); }
function reset(results = []) {
  fakeDb(results); globalThis.collectionAdmin = true; globalThis.collectionRefreshes = []; globalThis.catalogPredicates = []; globalThis.collectionCatalog = [piece(productA), piece(productB)];
}
reset();
const { collectionInput } = await load('lib/collectionValidation.ts');
const { getCollections, getCollectionBySlug, getNavbarCollections } = await load('lib/collections.ts');
const { saveCollection, deleteCollection } = await load('lib/collectionAdmin.ts');
const api = await load('src/app/api/admin/collections/route.ts');
const archive = await load('src/app/(user)/collection/page.tsx');
const detail = await load('src/app/(user)/collection/[slug]/page.tsx');

assert.equal(collectionInput.parse({ ...draft, productIds: [productA, productA] }).productIds.length, 1);
for (const invalid of [{ isComingSoon: 'false' }, { slug: '../bad' }, { image: 'javascript:alert(1)' }, { productIds: ['bad'] }, { sortOrder: -1 }, { name: '' }]) {
  assert.equal(collectionInput.safeParse({ ...draft, ...invalid }).success, false);
}
console.log('PASS collection validation, duplicate assignments, and invalid input');

reset([[row]]);
await getNavbarCollections();
assert.match(predicate(0).sql, /"collections"\."is_active" = \$1/);
assert.match(predicate(0).sql, /"collections"\."is_coming_soon" = \$2/);
assert.deepEqual(predicate(0).params, [true, false]);
reset([[row], [{ collectionId, productId: productA }, { collectionId, productId: productB }]]);
globalThis.collectionCatalog[1].pricingConfig = [];
const summaries = await getCollections();
assert.equal(summaries[0].productCount, 1);
assert.deepEqual(predicate(0).params, [true]);
console.log('PASS public visibility and piece counts exclude products with no visible sizes');

reset([[row], [{ productId: productB }, { productId: productA }]]);
const collection = await getCollectionBySlug('aarambh');
assert.deepEqual(collection.products.map(item => item.id), [productB, productA]);
assert.deepEqual(predicate(0).params, ['aarambh', true, false]);
assert.match(predicate(0).sql, /is_coming_soon/);
const productFilter = dialect.sqlToQuery(globalThis.catalogPredicates[0]);
assert.deepEqual(productFilter.params, [productB, productA]);
assert.match(dialect.sqlToQuery(selects[1].order[0]).sql, /"priority" desc/);
const missingPriority = Object.assign(new Error('column collection_products.priority does not exist'), { code: '42703' });
reset([[row], missingPriority, [{ productId: productB }, { productId: productA }]]);
assert.deepEqual((await getCollectionBySlug('aarambh')).products.map(item => item.id), [productB, productA]);
reset([[row], []]);
assert.deepEqual((await getCollectionBySlug('aarambh')).products, []);
assert.equal(globalThis.catalogPredicates.length, 0);
reset([[]]);
assert.equal(await getCollectionBySlug('coming-soon'), null);
console.log('PASS collection-only product filtering, order, empty collections, and direct URL availability guard');

reset([[{ id: productA }, { id: productB }]]);
await saveCollection(draft, false);
assert.equal(writes[0].op, 'insert');
assert.deepEqual(writes[2].value.map(item => [item.collectionId, item.productId, item.sortOrder]), [[collectionId, productA, 0], [collectionId, productB, 1]]);
assert.deepEqual(writes[2].value.map(item => item.priority), [1, 1]);
assert.ok(globalThis.collectionRefreshes.some(args => args[1] === 'layout'));
reset([[{ id: productA }, { id: productB }]]);
await saveCollection({ ...draft, productPriorities: { [productA]: 2 } }, false);
assert.deepEqual(writes[2].value.map(item => item.priority), [2, 1]);
reset([[{ id: productB }]]);
await saveCollection({ ...draft, id: collectionId, productIds: [productB] }, true);
assert.deepEqual(writes.map(item => item.op), ['update', 'delete', 'insert']);
assert.equal(writes[2].value.length, 1);
reset([[]]);
await assert.rejects(() => saveCollection(draft, false), /no longer exist/);
assert.equal(writes.length, 0);
reset();
await deleteCollection(collectionId);
assert.deepEqual(writes.map(item => item.table), ['collections']);
console.log('PASS transactional creation, product replacement, stale selection rejection, cache refresh, and collection-only deletion');

reset(); globalThis.collectionAdmin = false;
await assert.rejects(() => saveCollection(draft, false), /Admin sign-in/);
await assert.rejects(() => deleteCollection(collectionId), /Admin sign-in/);
for (const method of ['GET', 'POST', 'PUT', 'DELETE']) assert.equal((await api[method](new Request('http://localhost/api/admin/collections'))).status, 403);
assert.equal(writes.length, 0); assert.equal(selects.length, 0);
console.log('PASS all collection admin endpoints and mutations reject unauthorized callers');

const missing = () => Object.assign(new Error('relation "collections" does not exist'), { code: '42P01' });
reset([missing()]); assert.deepEqual(await getNavbarCollections(), []);
reset([missing()]); assert.deepEqual(await getCollections(), []);
reset([missing()]); assert.equal(await getCollectionBySlug('aarambh'), null);
reset([missing()]); assert.equal((await api.GET()).status, 503);
reset([new Error('Database offline')]); await assert.rejects(getNavbarCollections, /Database offline/);
console.log('PASS schema-pending storefront fallback, actionable admin status, and real failures remain visible');

reset([[row, { ...row, id: 'soon', slug: 'next-chapter', name: 'The next collection', isComingSoon: true }], [{ collectionId, productId: productA }]]);
const html = renderToStaticMarkup(await archive.default());
assert.match(html, /href="\/collection\/aarambh"/);
assert.match(html, /Coming soon/);
assert.doesNotMatch(html, /href="\/collection\/next-chapter"/);
reset([[row], [{ productId: productA }]]);
const productHtml = renderToStaticMarkup(await detail.default({ params: Promise.resolve({ slug: 'aarambh' }) }));
assert.match(productHtml, new RegExp(`href="/product/piece-${productA}\\?variant=`));
reset([[]]); await assert.rejects(() => detail.default({ params: Promise.resolve({ slug: 'soon' }) }), /NOT_FOUND/);
console.log('PASS rendered archive disables coming-soon cards; live pieces link to variant-aware product flow; closed pages return not found');
console.log('All collection checks passed. No database, storage, or payment services were changed.');
