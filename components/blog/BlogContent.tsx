"use client";

import {
  codeBlockPlugin,
  codeMirrorPlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  tablePlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

type BlogContentProps = {
  markdown?: string | null;
  className?: string;
};

export function BlogContent({ markdown, className = "" }: BlogContentProps) {
  return (
    <div className={`blog-content-view ${className}`}>
      <MDXEditor
        markdown={markdown || ""}
        readOnly
        className="blog-content-editor"
        contentEditableClassName="blog-content-prose"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          quotePlugin(),
          markdownShortcutPlugin(),
          tablePlugin(),
          imagePlugin({ disableImageResize: true }),
          codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              css: "css",
              html: "html",
              js: "javascript",
              jsx: "JavaScript (React)",
              json: "json",
              ts: "typescript",
              tsx: "TypeScript (React)",
              txt: "text",
            },
          }),
        ]}
      />
    </div>
  );
}
