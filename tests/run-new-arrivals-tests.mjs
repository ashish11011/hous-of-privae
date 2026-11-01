import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { build } from "esbuild";
import { getTableName } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const dialect = new PgDialect();
const id = "00000000-0000-4000-8000-000000000001";
const variantId = "00000000-0000-4000-8000-000000000002";
const draft = { name: "New silk piece", slug: "new-silk-piece", pricingConfig: [{ size: "s", basePrice: 1000, isVisible: true }], variants: [{ color: "Gold", bannerImage: "/silk.jpg", images: [] }] };

async function load(entry) {
  const fixtures = {
    "@/lib/db": "export const db = new Proxy({}, { get: (_, key) => globalThis.newProductDb[key] });",
    "@/lib/auth/admin": "export async function getOrderAdmin() { return globalThis.newProductAdmin ? { id: 'admin' } : null; }",
    "@/lib/categoryHelper": "export async function getAllCategories() { return []; }",
    "@/lib/productCatalog": "export async function loadCatalog(where) { globalThis.newProductFilter = where; return globalThis.newProductCatalog; }",
    "@/lib/productHelper": "export async function getNewProducts() { return globalThis.newProductCards; }",
    "next/link": "import React from 'react'; export default function Link({children,...props}) { return React.createElement('a',props,children); }",
    "@/components/ProductCard": "import React from 'react'; import { productHref } from '@/lib/productAdapter'; export default function Card({product}) { return React.createElement('a', {href:productHref(product),'data-product':product.id}, product.name); }",
  };
  const result = await build({entryPoints:[entry],bundle:true,write:false,platform:"node",format:"cjs",packages:"external",plugins:[{name:"new-arrivals-fixtures",setup(build){
    build.onResolve({filter:/^(?:@\/lib\/(?:db|auth\/admin|categoryHelper|productCatalog|productHelper)|\.\/(?:db|categoryHelper|productCatalog)|@\/components\/ProductCard|\.\/ProductCard|next\/link)$/},args=>({path:args.path==="./ProductCard"?"@/components/ProductCard":args.path.startsWith("./")?"@/lib/"+args.path.slice(2):args.path,namespace:"fixture"}));
    build.onLoad({filter:/.*/,namespace:"fixture"},args=>({contents:fixtures[args.path],loader:"js",resolveDir:process.cwd()}));
  }}]});
  const module={exports:{}};
  new Function("require","module","exports",result.outputFiles[0].text)(require,module,module.exports);
  return module.exports;
}
let writes=[];
function reset() {
  writes=[]; globalThis.newProductAdmin=true;
  const db={
    async transaction(callback){return callback(db);},
    select(){let table;const chain={from(value){table=getTableName(value);return chain;},where(){return chain;},for(){return chain;},then(resolve,reject){return Promise.resolve(table==='products'?[{id}]:[{id:variantId}]).then(resolve,reject);}};return chain;},
    insert(table){return{values(value){writes.push({table:getTableName(table),value});return{returning:async()=>[{id:getTableName(table)==='products'?id:variantId}]};}};},
    update(table){return{set(value){writes.push({table:getTableName(table),value});return{where:async()=>[]};}};},
    delete(){return{where:async()=>[]};},
  };
  globalThis.newProductDb=db;
}
reset();
const schema=await load('db/productSchema.ts');
assert.equal(schema.product.isNew.name,'is_new');assert.equal(schema.product.isNew.default,true);assert.equal(schema.product.isNew.notNull,true);
const {createProduct,updateProdcutInfoBySlug,getNewProducts}=await load('lib/productHelper.ts');
await createProduct(draft);assert.equal(writes.find(row=>row.table==='products').value.isNew,true);
reset();await createProduct({...draft,isNew:false});assert.equal(writes.find(row=>row.table==='products').value.isNew,false);
for(const isNew of [false,true]){reset();await updateProdcutInfoBySlug({slug:draft.slug,productDetails:{...draft,isNew}});assert.equal(writes.find(row=>row.table==='products').value.isNew,isNew);}
reset();await updateProdcutInfoBySlug({slug:draft.slug,productDetails:draft});assert.equal(writes.find(row=>row.table==='products').value.isNew,undefined);
reset();await assert.rejects(()=>createProduct({...draft,isNew:'false'}));assert.equal(writes.length,0);
globalThis.newProductAdmin=false;await assert.rejects(()=>createProduct(draft),/Admin sign-in/);await assert.rejects(()=>updateProdcutInfoBySlug({slug:draft.slug,productDetails:draft}),/Admin sign-in/);
console.log('PASS schema default, explicit false, admin updates in both directions, omitted update preservation, validation and authorization');

const piece={...draft,id,isNew:true,variants:[{...draft.variants[0],id:variantId}]};
globalThis.newProductCatalog=[piece,{...piece,id:'archived',pricingConfig:[]},{...piece,id:'no-variants',variants:[]}];
const cards=await getNewProducts();const predicate=dialect.sqlToQuery(globalThis.newProductFilter);
assert.match(predicate.sql,/"products"\."is_new" = \$1/);assert.deepEqual(predicate.params,[true]);assert.equal(cards.length,1);assert.equal(cards[0].variantId,variantId);
console.log('PASS new-arrival query filters the boolean and excludes archived/unpurchasable cards');

const carousel=await load('components/ProductCarousel.tsx');const page=await load('src/app/(user)/new-arrivals/page.tsx');
globalThis.newProductCards=Array.from({length:6},(_,index)=>({...cards[0],id:`piece-${index}`,variantId:`variant-${index}`}));
const homeHtml=renderToStaticMarkup(await carousel.default());const allHtml=renderToStaticMarkup(await page.default());
assert.equal((homeHtml.match(/data-product=/g)||[]).length,4);assert.match(homeHtml,/href="\/new-arrivals"/);assert.equal((allHtml.match(/data-product=/g)||[]).length,6);assert.match(allHtml,/href="\/product\/new-silk-piece\?variant=variant-0"/);
globalThis.newProductCards=[];assert.equal(await carousel.default(),null);assert.match(renderToStaticMarkup(await page.default()),/New pieces are on their way/);
console.log('PASS home preview, filtered full listing, variant links and empty states');
console.log('All new-arrival checks passed. No database or payment services were accessed.');
