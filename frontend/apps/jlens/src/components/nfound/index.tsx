const NFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <img
        src="../../../public/page_not_found.svg"
        alt="Page Not Found"
        className="w-96 h-auto"
      />
      <h1 className="font-bold mt-4 text-gray-1200">404 - Page Not found</h1>
      <p className="font-semibold mt-4 text-gray-700">The page you’re looking for isn’t available — but there’s more to discover.</p>
    </div>
  );
};

export default NFound;
