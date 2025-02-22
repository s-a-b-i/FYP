import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Button from './Button';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'destructive',
  isLoading = false,
  confirmDisabled = false,
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-background p-6 text-left align-middle shadow-xl transition-all border border-border/20 dark:border-border/40">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-2 rounded-full hover:bg-accent/10 transition-colors"
                >
                  <FiX className="w-5 h-5 text-muted-foreground" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-full ${variant === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'}`}>
                    <FiAlertTriangle className="w-5 h-5" />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold leading-6 text-foreground flex-1"
                  >
                    {title}
                  </Dialog.Title>
                </div>

                {/* Content */}
                <div className="mt-2 border-t border-border/20 dark:border-border/40 pt-4">
                  <div className="text-base text-muted-foreground">
                    {typeof message === 'string' ? (
                      <p>{message}</p>
                    ) : (
                      message
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border/20 dark:border-border/40">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    className="min-w-[100px] text-base"
                  >
                    {cancelText}
                  </Button>
                  <Button
                    variant={variant}
                    onClick={onConfirm}
                    disabled={isLoading || confirmDisabled}
                    className="min-w-[100px] text-base"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg 
                          className="animate-spin h-4 w-4" 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24"
                        >
                          <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                          />
                          <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      confirmText
                    )}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmationModal;