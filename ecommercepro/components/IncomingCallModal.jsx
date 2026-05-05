"use client";

import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IncomingCallModal = ({ caller, onAccept, onDecline }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[999] w-[90%] max-w-md"
      >
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 border-4 border-blue-500/30 animate-pulse">
              {caller?.image ? (
                <img src={caller.image} alt={caller.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500">
                  {caller?.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-500 p-2 rounded-full shadow-lg">
              <Video size={18} className="text-white" />
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-1">
              {caller?.username || "Incoming Call"}
            </h3>
            <p className="text-blue-400 text-sm font-medium animate-pulse">
              is calling you...
            </p>
          </div>

          <div className="flex gap-12 mt-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDecline}
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-900/40 transition-colors">
                <PhoneOff size={28} className="text-white" />
              </div>
              <span className="text-xs text-gray-400 font-medium group-hover:text-red-400">Decline</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onAccept}
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-900/40 transition-colors animate-bounce">
                <Phone size={28} className="text-white" />
              </div>
              <span className="text-xs text-gray-400 font-medium group-hover:text-green-400">Accept</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IncomingCallModal;
