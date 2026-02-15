export default function JobCard() {
  return (
    <div className="bg-white p-4 rounded shadow hover:shadow-lg transition">
      <h3 className="font-semibold">Event Helper</h3>
      <p className="text-sm text-gray-500">₹500 | 3 Hours</p>
      <button className="bg-green-600 text-white px-3 py-1 rounded mt-2">
        Apply
      </button>
    </div>
  );
}
