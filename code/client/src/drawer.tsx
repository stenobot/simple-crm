import { useEffect } from "react";

export const Drawer: React.FC<{
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, onClose]);

    return (
        <div
            className={`fixed inset-0 z-40 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            aria-hidden={!open}>
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />
            <aside
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col transition-transform duration-200 ${open ? "translate-x-0" : "translate-x-full"}`}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="text-gray-500 hover:text-gray-800 text-xl leading-none">
                        ×
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto p-4">{children}</div>
            </aside>
        </div>
    );
};
