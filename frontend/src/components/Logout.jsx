/**
 * Logout.jsx - SlideRx Logout Page Component
 *
 * Simple logout confirmation page with branding message
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "aws-amplify/auth";

const Logout = () => {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const doSignOut = async () => {
      try {
        await signOut();
      } catch (e) {
        // ignore
      } finally {
        setDone(true);
      }
    };
    doSignOut();
  }, []);

  return null;
  // return (
  //   <div className="min-h-screen bg-gradient-to-br from-[#2563EB] to-[#1e40af] flex items-center justify-center px-4">
  //     <div className="max-w-2xl mx-auto text-center">
  //       <div className="bg-white rounded-2xl shadow-2xl p-12">
  //         {/* SlideRx Logo/Title */}
  //         <h1 className="text-5xl font-bold text-[#2563EB] mb-6">SlideRx</h1>

  //         {/* Thank you message */}
  //         <div className="mb-8">
  //           <h2 className="text-3xl font-semibold text-gray-900 mb-4">
  //             Thank you for using SlideRx!
  //           </h2>
  //           <p className="text-xl text-[#64748B] italic">
  //             Helping business professionals increase their impact, one slide at
  //             a time.
  //           </p>
  //         </div>

  //         {/* Checkmark icon */}
  //         <div className="flex justify-center mb-8">
  //           <div className="w-20 h-20 bg-[#10B981] rounded-full flex items-center justify-center">
  //             <svg
  //               className="w-12 h-12 text-white"
  //               fill="none"
  //               stroke="currentColor"
  //               viewBox="0 0 24 24"
  //             >
  //               <path
  //                 strokeLinecap="round"
  //                 strokeLinejoin="round"
  //                 strokeWidth={3}
  //                 d="M5 13l4 4L19 7"
  //               />
  //             </svg>
  //           </div>
  //         </div>

  //         {/* Action buttons */}
  //         <div className="flex flex-col sm:flex-row gap-4 justify-center">
  //           <Link
  //             to="/"
  //             className="px-8 py-3 bg-[#2563EB] text-white rounded-lg font-semibold hover:bg-[#1e40af] transition-colors shadow-lg hover:shadow-xl"
  //           >
  //             Return to Home
  //           </Link>
  //           <Link
  //             to="/"
  //             className="px-8 py-3 bg-white text-[#2563EB] border-2 border-[#2563EB] rounded-lg font-semibold hover:bg-blue-50 transition-colors"
  //           >
  //             Sign in again
  //           </Link>
  //         </div>
  //       </div>

  //       {/* Footer note */}
  //       <p className="text-blue-100 text-sm mt-6">
  //         {done
  //           ? "You have been successfully logged out."
  //           : "Signing you out..."}
  //       </p>
  //     </div>
  //   </div>
  // );
};

export default Logout;
