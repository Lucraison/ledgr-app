export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-sm flex flex-col gap-4">
        <p className="text-white text-sm">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-[#333] text-[#aaa] bg-transparent cursor-pointer text-sm hover:border-[#555] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 cursor-pointer text-sm hover:bg-red-500/30 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
