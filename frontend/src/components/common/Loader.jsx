export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex items-center justify-center py-12 text-gray-500">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
      {text}
    </div>
  );
}
