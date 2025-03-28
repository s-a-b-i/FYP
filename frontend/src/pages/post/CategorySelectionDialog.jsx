// import { Dialog } from "@/components/ui/dialog";
// import { ChevronRight } from "lucide-react";
// import { useEffect, useState } from "react";
// import { H2 } from "@/components/shared/Heading";
// import { categoryAPI } from "@/api/category";

// const CategorySelectionDialog = ({ isOpen, onClose, onSelectCategory }) => {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       const fetchCategories = async () => {
//         try {
//           setLoading(true);
//           const response = await categoryAPI.getCategories();
//           setCategories(response.data || response);
//         } catch (error) {
//           console.error("Failed to fetch categories:", error);
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchCategories();
//     }
//   }, [isOpen]);

//   if (!isOpen) return null;

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
//         <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//           <div className="flex justify-between items-center mb-4">
//             <H2>Select Category</H2>
//             <button
//               onClick={onClose}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               ✕
//             </button>
//           </div>
//           {loading ? (
//             <div>Loading categories...</div>
//           ) : (
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//               {categories.map((category) => (
//                 <button
//                   key={category._id}
//                   onClick={() => {
//                     onSelectCategory(category);
//                     onClose();
//                   }}
//                   className="group p-4 border rounded-lg hover:border-primary transition-colors"
//                 >
//                   <div className="flex items-center space-x-3">
//                     <div className="w-12 h-12 rounded-full overflow-hidden">
//                       <img
//                         src={category.icon?.url || "/default-icon.png"}
//                         alt={category.name}
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                     <div className="flex-1 text-left">
//                       <div className="font-medium">{category.name}</div>
//                     </div>
//                     <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary" />
//                   </div>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </Dialog>
//   );
// };

// export default CategorySelectionDialog;

import { Dialog } from "@/components/ui/dialog";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { H2 } from "@/components/shared/Heading";
import { categoryAPI } from "@/api/category";

const CategorySelectionDialog = ({ isOpen, onClose, onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryAPI.getCategories();
        setCategories(response.data || response);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <H2>Select Category</H2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {loading ? (
            <div>Loading categories...</div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => {
                    onSelectCategory(category);
                    onClose();
                  }}
                  className="group p-4 border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img
                        src={category.icon?.url || "/default-icon.png"}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{category.name}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div>No categories found</div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default CategorySelectionDialog;