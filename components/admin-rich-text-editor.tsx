"use client";

import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
} from "react";

import { getEditorRichTextHtml } from "@/lib/blog-content";

type QuillChangeHandler = () => void;

type QuillInstance = {
  clipboard: {
    dangerouslyPasteHTML: (html: string) => void;
  };
  getText: () => string;
  off: (eventName: "text-change", handler: QuillChangeHandler) => void;
  on: (eventName: "text-change", handler: QuillChangeHandler) => void;
  root: HTMLDivElement;
  setText: (text: string) => void;
};

type QuillConstructor = new (
  container: Element,
  options: {
    formats: string[];
    modules: {
      toolbar: Element;
    };
    placeholder?: string;
    theme: "snow";
  },
) => QuillInstance;

type AdminRichTextEditorProps = {
  compact?: boolean;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

const supportedFormats = [
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "link",
] as const;

export function AdminRichTextEditor({
  compact = false,
  label,
  onChange,
  placeholder,
  value,
}: AdminRichTextEditorProps) {
  const labelId = useId();
  const editorHostRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const initialValueRef = useRef(value);
  const quillRef = useRef<QuillInstance | null>(null);
  const lastCommittedValueRef = useRef("");
  const [isReady, setIsReady] = useState(false);
  const handleChange = useEffectEvent(onChange);

  useEffect(() => {
    let isDisposed = false;
    let cleanup = () => {};

    const mountEditor = async () => {
      if (!editorHostRef.current || !toolbarRef.current || quillRef.current) {
        return;
      }

      const quillModule = (await import("quill")).default;

      if (isDisposed || !editorHostRef.current || !toolbarRef.current) {
        return;
      }

      const Quill = quillModule as unknown as QuillConstructor;
      const quill = new Quill(editorHostRef.current, {
        formats: [...supportedFormats],
        modules: {
          toolbar: toolbarRef.current,
        },
        placeholder,
        theme: "snow",
      });

      const initialValue = getEditorRichTextHtml(initialValueRef.current);
      lastCommittedValueRef.current = initialValue;

      if (initialValue) {
        quill.clipboard.dangerouslyPasteHTML(initialValue);
      } else {
        quill.setText("");
      }

      const handleTextChange = () => {
        const nextValue = quill.getText().trim()
          ? quill.root.innerHTML.trim()
          : "";

        lastCommittedValueRef.current = nextValue;
        handleChange(nextValue);
      };

      quill.on("text-change", handleTextChange);
      quillRef.current = quill;
      setIsReady(true);

      cleanup = () => {
        quill.off("text-change", handleTextChange);
        quillRef.current = null;

        if (editorHostRef.current) {
          editorHostRef.current.innerHTML = "";
        }
      };
    };

    mountEditor();

    return () => {
      isDisposed = true;
      cleanup();
    };
  }, [placeholder]);

  useEffect(() => {
    const quill = quillRef.current;

    if (!quill) {
      return;
    }

    const nextValue = getEditorRichTextHtml(value);

    if (nextValue === lastCommittedValueRef.current) {
      return;
    }

    lastCommittedValueRef.current = nextValue;

    if (nextValue) {
      quill.clipboard.dangerouslyPasteHTML(nextValue);
      return;
    }

    quill.setText("");
  }, [value]);

  return (
    <div className="field-stack">
      <span className="subsection-label" id={labelId}>
        {label}
      </span>
      <div
        aria-labelledby={labelId}
        className={compact ? "rich-text-field rich-text-field-compact" : "rich-text-field"}
      >
        <div className="ql-toolbar ql-snow rich-text-toolbar" ref={toolbarRef}>
          <span className="ql-formats">
            <button aria-label={`Bold ${label}`} className="ql-bold" type="button" />
            <button
              aria-label={`Italic ${label}`}
              className="ql-italic"
              type="button"
            />
            <button
              aria-label={`Underline ${label}`}
              className="ql-underline"
              type="button"
            />
            <button aria-label={`Strike ${label}`} className="ql-strike" type="button" />
          </span>
          <span className="ql-formats">
            <button
              aria-label={`Block quote ${label}`}
              className="ql-blockquote"
              type="button"
            />
            <button
              aria-label={`Bulleted list ${label}`}
              className="ql-list"
              type="button"
              value="bullet"
            />
            <button
              aria-label={`Numbered list ${label}`}
              className="ql-list"
              type="button"
              value="ordered"
            />
          </span>
          <span className="ql-formats">
            <button aria-label={`Add link to ${label}`} className="ql-link" type="button" />
            <button aria-label={`Clear formatting from ${label}`} className="ql-clean" type="button" />
          </span>
        </div>

        <div className="rich-text-editor-shell">
          <div className="rich-text-editor-host" ref={editorHostRef} />
          {!isReady ? (
            <div className="rich-text-editor-loading">Loading editor...</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
