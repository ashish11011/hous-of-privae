"use client";

import React from "react";
import {
  MDXEditor,
  UndoRedo,
  BoldItalicUnderlineToggles,
  toolbarPlugin,
  CodeToggle,
  InsertCodeBlock,
  codeBlockPlugin,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  quotePlugin,
  markdownShortcutPlugin,
  ListsToggle,
  linkDialogPlugin,
  CreateLink,
  InsertImage,
  InsertTable,
  tablePlugin,
  imagePlugin,
  codeMirrorPlugin,
  ConditionalContents,
  ChangeCodeMirrorLanguage,
  Separator,
  InsertThematicBreak,
  diffSourcePlugin,
  MDXEditorMethods,
  BlockTypeSelect,
} from "@mdxeditor/editor";
import { Ref } from "react";
import "@mdxeditor/editor/style.css";
interface Props {
  value: string;
  editorRef?: Ref<MDXEditorMethods> | null;
  fieldChange: (value: string) => void;
}
const Editor = ({ value, editorRef, fieldChange }: Props) => {
  return (
    <MDXEditor
      markdown={value}
      ref={editorRef}
      onChange={fieldChange}
      className="background-light800_dark200 light-border-2 markdown-editor dark-editor grid w-full border"
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        quotePlugin(),
        markdownShortcutPlugin(),
        tablePlugin(),
        imagePlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            css: "css",
            txt: "txt",
            sql: "sql",
            html: "html",
            sass: "sass",
            scss: "scss",
            bash: "bash",
            json: "json",
            js: "javascript",
            ts: "typescript",
            "": "unspecified",
            tsx: "TypeScript (React)",
            jsx: "JavaScript (React)",
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
};
export default Editor;
