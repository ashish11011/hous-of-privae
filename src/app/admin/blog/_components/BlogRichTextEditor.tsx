"use client";

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ChangeCodeMirrorLanguage,
  codeBlockPlugin,
  codeMirrorPlugin,
  CodeToggle,
  ConditionalContents,
  CreateLink,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  Separator,
  tablePlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { uploadFileToS3 } from "@/lib/s3-upload";
import { getImagePreviewUrl } from "@/lib/blogImage";

type BlogRichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

async function uploadBlogContentImage(image: File) {
  const key = await uploadFileToS3(image, "blog-content", "key");
  return getImagePreviewUrl(key);
}

export function BlogRichTextEditor({ value, onChange }: BlogRichTextEditorProps) {
  return (
    <MDXEditor
      markdown={value}
      onChange={(markdown) => onChange(markdown)}
      className="blog-admin-editor border bg-background"
      contentEditableClassName="blog-content-prose min-h-[420px] px-4 py-5"
      placeholder="Write the blog content here..."
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        quotePlugin(),
        markdownShortcutPlugin(),
        tablePlugin(),
        imagePlugin({
          imageUploadHandler: uploadBlogContentImage,
          disableImageResize: false,
        }),
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
          autoLoadLanguageSupport: true,
        }),
        diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "" }),
        toolbarPlugin({
          toolbarContents: () => (
            <ConditionalContents
              options={[
                {
                  when: (editor) => editor?.editorType === "codeblock",
                  contents: () => <ChangeCodeMirrorLanguage />,
                },
                {
                  fallback: () => (
                    <>
                      <UndoRedo />
                      <BlockTypeSelect />
                      <Separator />
                      <BoldItalicUnderlineToggles />
                      <CodeToggle />
                      <Separator />
                      <ListsToggle />
                      <Separator />
                      <CreateLink />
                      <InsertImage />
                      <Separator />
                      <InsertTable />
                      <InsertThematicBreak />
                      <Separator />
                      <InsertCodeBlock />
                    </>
                  ),
                },
              ]}
            />
          ),
        }),
      ]}
    />
  );
}
