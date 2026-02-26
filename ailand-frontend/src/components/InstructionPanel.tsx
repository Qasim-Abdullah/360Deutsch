export default function InstructionPanel() {
  return (
    <div className="bg-green-100 rounded-2xl p-6 shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        📝 How to Play:
      </h2>
      <ol className="space-y-2 text-gray-700">
        <li className="flex gap-2">
          <span className="font-semibold">1.</span>
          <span>
            <strong>Click the audio button</strong> to hear a German word
          </span>
        </li>
        <li className="flex gap-2">
          <span className="font-semibold">2.</span>
          <span>
            <strong>Type the word</strong> with its article (der, die, das)
          </span>
        </li>
        <li className="flex gap-2">
          <span className="font-semibold">3.</span>
          <span>
            <strong>Click &quot;Check Answer&quot;</strong>
          </span>
        </li>
        <li className="flex gap-2">
          <span className="font-semibold">4.</span>
          <span>
            If correct, the <strong>object appears in the room!</strong>
          </span>
        </li>
        <li className="flex gap-2">
          <span className="font-semibold">5.</span>
          <span>Fill the entire room with 6 objects</span>
        </li>
      </ol>
    </div>
  );
}
