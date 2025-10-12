export default function Footer() {
    return (
      <footer className="w-full text-center py-4 border-t border-gray-200 text-gray-500 text-sm bg-white mt-auto">
        © {new Date().getFullYear()} <span className="font-semibold text-blue-600">Bitexly</span>. All rights reserved.
      </footer>
    );
  }  