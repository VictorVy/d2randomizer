import Spinner from "./Spinner";

interface LoadingOverlayProps {
    loading: boolean;
}

const LoadingOverlay = ({ loading }: LoadingOverlayProps) => {
    return (
        <div
            className={
                "absolute z-10 flex h-screen w-screen items-center justify-center justify-items-center bg-gray-700 bg-opacity-80 transition-opacity duration-500" +
                (loading ? " opacity-100" : " pointer-events-none opacity-0")
            }
        >
            <Spinner />
        </div>
    );
};

export default LoadingOverlay;
