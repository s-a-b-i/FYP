// import { Plus, X, Tags, Key } from 'lucide-react';
// import { useState, useEffect, useRef } from 'react';
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// const AddItemButton = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [selectedType, setSelectedType] = useState(null);
//   const [isVisible, setIsVisible] = useState(false);
//   const [isInteracting, setIsInteracting] = useState(false);
//   const timeoutRef = useRef(null);
  
//   useEffect(() => {
//     const handleScroll = () => {
//       setIsVisible(true);
      
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
      
//       if (!isInteracting) {
//         timeoutRef.current = setTimeout(() => {
//           setIsVisible(false);
//         }, 1500);
//       }
//     };

//     window.addEventListener('scroll', handleScroll);
    
//     return () => {
//       window.removeEventListener('scroll', handleScroll);
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//     };
//   }, [isInteracting]);

//   const handleMouseEnter = () => {
//     setIsInteracting(true);
//     setIsVisible(true);
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }
//   };

//   const handleMouseLeave = () => {
//     setIsInteracting(false);
//     if (!isMenuOpen) {
//       timeoutRef.current = setTimeout(() => {
//         setIsVisible(false);
//       }, 1500);
//     }
//   };

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

//   const handleOptionClick = (type) => {
//     setSelectedType(type);
//     setIsMenuOpen(false);
//   };

//   return (
//     <div 
//       className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
//         isVisible || isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
//       }`}
//       onMouseEnter={handleMouseEnter}
//       onMouseLeave={handleMouseLeave}
//     >
//       <div className="relative">
//         <div className={`absolute bottom-16 right-2 transition-all duration-300 flex flex-col gap-3
//           ${isMenuOpen ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10 pointer-events-none'}`}>
          
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button
//                 size="lg"
//                 onClick={() => handleOptionClick('sell')}
//                 className="rounded-full w-12 h-12 bg-blue-500 hover:bg-blue-600 shadow-lg transform hover:scale-110 transition-all duration-300 p-0 group"
//               >
//                 <div className="relative">
//                   <Tags className="w-5 h-5" />
//                   <span className="absolute left-14 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
//                     Sell Item
//                   </span>
//                 </div>
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Sell New Item</DialogTitle>
//               </DialogHeader>
//               <div className="grid gap-4 py-4">
//                 <p>Form for selling a new item will be displayed here.</p>
//               </div>
//             </DialogContent>
//           </Dialog>

//           <Dialog>
//             <DialogTrigger asChild>
//               <Button
//                 size="lg"
//                 onClick={() => handleOptionClick('rent')}
//                 className="rounded-full w-12 h-12 bg-emerald-500 hover:bg-emerald-600 shadow-lg transform hover:scale-110 transition-all duration-300 p-0 group"
//               >
//                 <div className="relative">
//                   <Key className="w-5 h-5" />
//                   <span className="absolute left-14 bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
//                     Rent Item
//                   </span>
//                 </div>
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Rent New Item</DialogTitle>
//               </DialogHeader>
//               <div className="grid gap-4 py-4">
//                 <p>Form for renting a new item will be displayed here.</p>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>

//         <Button
//           size="lg"
//           onClick={toggleMenu}
//           className={`rounded-full w-14 h-14 shadow-lg transition-all duration-300 flex items-center justify-center p-0
//             ${isMenuOpen 
//               ? 'bg-red-500 hover:bg-red-600 rotate-45' 
//               : 'bg-green-600 hover:bg-green-700'}`}
//         >
//           <Plus className="w-6 h-6" />
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default AddItemButton;

import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Plus, Tags, Key, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';

const AddItemButton = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isVisible, setIsVisible] = useState(true);
  const [scrollTimeout, setScrollTimeout] = useState(null);
  
  const handleOptionClick = (type) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/post?type=${type}`);
  };

  useEffect(() => {
    const handleScroll = () => {
      // Always show the buttons when scrolling
      setIsVisible(true);

      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Set new timeout to hide buttons after scrolling stops
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 1500); // Hide after 1.5 seconds of no scrolling

      setScrollTimeout(timeout);
    };

    // Show buttons when mouse moves
    const handleMouseMove = () => {
      setIsVisible(true);
      
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 1500);

      setScrollTimeout(timeout);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [scrollTimeout]);

  return (
    <div 
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-3 transition-all duration-300 ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-20 opacity-0'
      }`}
    >
      <Button
        size="lg"
        onClick={() => handleOptionClick('sell')}
        className="rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg transition-all duration-300 px-6"
      >
        <Tags className="w-5 h-5 mr-2" />
        Sell
      </Button>

      <Button
        size="lg"
        onClick={() => handleOptionClick('rent')}
        className="rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg transition-all duration-300 px-6"
      >
        <Key className="w-5 h-5 mr-2" />
        Rent
      </Button>

      <Button
        size="lg"
        onClick={() => handleOptionClick('exchange')}
        className="rounded-full bg-purple-500 hover:bg-purple-600 shadow-lg transition-all duration-300 px-6"
      >
        <RefreshCw className="w-5 h-5 mr-2" />
        Exchange
      </Button>
    </div>
  );
};

export default AddItemButton;