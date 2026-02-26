type RevealedObject = {
  article: string;
  word: string;
};

type RoomViewerProps = {
  revealedObjects: RevealedObject[];
};

export default function RoomViewer({ revealedObjects }: RoomViewerProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-md min-h-[600px]">
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-96 flex items-center justify-center border-4 border-dashed border-gray-300">
        <div className="text-center text-gray-500">
          <p className="text-2xl mb-2">🏠</p>
          <p className="font-semibold">Your 3D Room Goes Here</p>
          <p className="text-sm mt-2">Objects revealed: {revealedObjects.length}</p>
          {revealedObjects.length > 0 && (
            <div className="mt-4 space-y-1">
              {revealedObjects.map((obj, idx) => (
                <div key={idx} className="text-sm text-gray-700">
                  ✓ {obj.article} {obj.word}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-700 flex items-center justify-center gap-2">
          ⭐{" "}
          <span>
            <strong>Objects appear one by one as you answer correctly!</strong>
          </span>
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Room starts empty — Fills up as you progress
        </p>
      </div>
    </div>
  );
}
