import { useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { createRoot } from 'react-dom/client'
import "./assets/css/style.css";

const protocol = [
  { id: 1, name: "HTTP", value: "http" },
  { id: 2, name: "HTTPS", value: "https" }
];

const validateAddress = (address: string): boolean => {
  return /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/.test(address);
};

function ProxyManager() {
  const [selectedProtocol, setSelectedProtocol] = useState(protocol[0]);
  const [address, setAddress] = useState("");
  const [port, setPort] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(true);
  const [loading, setLoading] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");

  const loadProxy = async () => {
    if (!address || !port) {
      setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Address atau Port kosong!`]);
      return;
    }

    if (!validateAddress(address)) {
      setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Address tidak valid!`]);
      return;
    }

    const proxyUrl = `${selectedProtocol.value}://${address}:${port}`;

    const currentUrl = window.location.href;
    const currentHostname = window.location.hostname;

    if (address === currentHostname || address === "localhost" || address === "127.0.0.1") {
      if (port === window.location.port) {
        setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Error:: ${currentUrl}`]);
        return;
      }
    }

    setLoading(true);
    setLog((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Menyambungkan ke ${proxyUrl}`
    ]);

    try {
      const iframeUrl = `http://localhost:2550/proxy?protocol=${selectedProtocol.value}&address=${address}&port=${port}`;

      const response = await fetch(iframeUrl, { method: "HEAD" });
      if (!response.ok) throw new Error("Gagal menghubungkan ke proxy");

      setIframeSrc(iframeUrl);
      setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Berhasil terhubung!`]);
    } catch (error) {
      let errorMessage = "Terjadi kesalahan!";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${errorMessage}`]);
    } finally {
      setTimeout(() => setLoading(false), 3000);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header Style */}
      <div className="bg-white border-b border-gray-200 py-4 px-4.5 flex justify-between items-center">
        <div className="text-start">
          <h3 className="text-xl/7 font-medium text-gray">
            Proxy Configuration Panel
          </h3>
          <p className="text-sm/6 text-gray/50">
            Configure and manage your proxy settings in one place.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Listbox value={selectedProtocol} onChange={setSelectedProtocol}>
            <div className="relative">
              <Listbox.Button
                className="relative block rounded-md border border-gray-300 bg-white w-25 px-3 py-1.5 text-left text-sm text-black/60 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                {selectedProtocol.name}
                <ChevronDownIcon
                  className="absolute top-2 right-2.5 size-4 text-black/60"
                  aria-hidden="true"
                />
              </Listbox.Button>

              <Transition
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-50 mt-1 w-25 bg-white border border-gray-300 rounded-md shadow-lg">
                  {protocol.map((item) => (
                    <Listbox.Option
                      key={item.id}
                      value={item}
                      className={({ active }) =>
                        `cursor-pointer py-1.5 px-3 text-sm flex justify-between items-center ${active ? 'bg-gray-200' : 'text-black'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span>{item.name}</span>
                          {selected && <CheckIcon className="rounded bg-black p-0.5 w-4 h-4 text-white" />}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
          <input
            type="text"
            placeholder="192.168.x.x"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border border-gray-300 rounded-md w-40 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
          <input
            type="number"
            placeholder="80"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            min="1"
            max="65535"
            className="border border-gray-300 rounded-md w-22 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
          <button
            onClick={loadProxy}
            className="bg-gray-800 hover:bg-black text-white px-3 py-1.5 rounded-md text-sm flex items-center"
          >
            <svg className="w-4 h-4 mr-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z" clipRule="evenodd" />
            </svg>
            <p className="mb-0.5">Connect</p>
          </button>
          <button
            onClick={() => setShowLog(!showLog)}
            className="bg-gray-800 hover:bg-black text-white px-3 py-1.5 rounded-md text-sm flex items-center"
          >
            <svg className="w-4 h-4 mr-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M20 6H10m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4m16 6h-2m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4m16 6H10m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4" />
            </svg>
            <p className="mb-0.5">Logs</p>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 mx-auto w-full p-4">
        {/* Frame Display */}
        <div className="flex-1 flex justify-center items-center border border-gray-200 rounded-md bg-white shadow-sm relative">
          {loading && (
            <div className="absolute top-0 left-0 right-0 bg-blue-50 text-gray-600 py-2 px-3 text-sm border-b border-blue-100">
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            </div>
          )}
          {iframeSrc ? (
            <iframe src={iframeSrc} className="w-full h-full border-none rounded-md"></iframe>
          ) : (
            <div className="text-gray-500 flex flex-col items-center justify-center p-8">
              <svg className="w-12 h-12 mb-3 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6" />
              </svg>
              <p>Masukkan Address dan Port</p>
              <p className="text-sm text-gray-400 mt-1">Lalu klik tombol Connect untuk memulai</p>
            </div>
          )}
        </div>

        {/* Log Panel */}
        <Transition
          show={showLog}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="w-64 ml-4 border border-gray-200 rounded-md shadow-sm bg-white overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 flex justify-between items-center">
              Connection Log
              <div className="flex space-x-2">
                {/* Clear Log */}
                <button
                  onClick={() => setLog([])}
                  className="text-gray-400 hover:text-gray-600"
                  title="Clear Log"
                >
                  <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4" />
                  </svg>
                </button>

                {/* Close Log */}
                <button
                  onClick={() => setShowLog(false)}
                  className="text-gray-400 hover:text-red-600"
                  title="Close Log"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-3 text-sm text-start font-mono h-[calc(100vh-10rem)] overflow-y-auto">
              {log.length === 0 ? (
                <div className="text-gray-400 text-xs italic">Belum ada aktivitas...</div>
              ) : (
                log.map((entry, index) => (
                  <div key={index} className="py-1 text-xs">{entry}</div>
                ))
              )}
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
}

function App() {
  return (
    <div>
      <ProxyManager />
    </div>
  );
}

export default App;

const rootElement = document.getElementById('root');

if (rootElement) {
  if (!(window as any).__root) {
    (window as any).__root = createRoot(rootElement);
  }
  (window as any).__root.render(<App />);
} else {
  console.error("Elemen 'root' tidak ditemukan!");
}
