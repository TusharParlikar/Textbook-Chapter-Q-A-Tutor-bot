import Editor, { type BeforeMount } from "@monaco-editor/react";

type Props = {
  code: string;
  onChange: (code: string) => void;
};

/* "Margin Ink": a dark editor theme built from the Margin palette. */
const defineTheme: BeforeMount = monaco => {
  monaco.editor.defineTheme("margin-ink", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "7A8079", fontStyle: "italic" },
      { token: "keyword", foreground: "E2775A" },
      { token: "string", foreground: "B5CC8E" },
      { token: "number", foreground: "D9B25E" },
      { token: "type", foreground: "8FB0CC" },
      { token: "identifier", foreground: "ECE6DA" },
      { token: "delimiter", foreground: "A9A396" },
    ],
    colors: {
      "editor.background": "#171c19",
      "editor.foreground": "#ECE6DA",
      "editorLineNumber.foreground": "#4C564F",
      "editorLineNumber.activeForeground": "#B9B3A6",
      "editor.lineHighlightBackground": "#1F2622",
      "editor.selectionBackground": "#3A4A3F",
      "editorCursor.foreground": "#E2775A",
      "editorIndentGuide.background1": "#262E29",
      "editorGutter.background": "#171c19",
    },
  });
};

export default function CodeEditor({ code, onChange }: Props) {
  return (
    <Editor
      height="420px"
      defaultLanguage="python"
      theme="margin-ink"
      beforeMount={defineTheme}
      value={code}
      onChange={value => onChange(value ?? "")}
      options={{
        fontSize: 14,
        fontFamily: "'IBM Plex Mono', Consolas, monospace",
        lineHeight: 22,
        minimap: { enabled: false },
        automaticLayout: true,
        tabSize: 4,
        padding: { top: 14, bottom: 14 },
        scrollBeyondLastLine: false,
        renderLineHighlight: "line",
        smoothScrolling: true,
      }}
    />
  );
}
