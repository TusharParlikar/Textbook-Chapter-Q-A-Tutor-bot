
import Editor from "@monaco-editor/react";

type Props = {
  code: string;
  onChange: (code: string) => void;
};

export default function CodeEditor({
  code,
  onChange
}: Props) {
  return (
    <Editor
      height="450px"
      defaultLanguage="python"
      theme="vs-dark"
      value={code}
      onChange={value => onChange(value ?? "")}
      options={{
        fontSize: 15,
        minimap: { enabled: false },
        automaticLayout: true,
        tabSize: 4,
        padding: { top: 16 },
        scrollBeyondLastLine: false
      }}
    />
  );
}
