import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface Props {
    onEnd: (dataUrl: string) => void;
    width?: number;
    height?: number;
}

export default function SignaturePad({ onEnd, width = 400, height = 200 }: Props) {
    const sigCanvas = useRef<SignatureCanvas>(null);

    const clear = () => {
        sigCanvas.current?.clear();
        onEnd('');
    };

    const handleEnd = () => {
        if (sigCanvas.current) {
            onEnd(sigCanvas.current.toDataURL());
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{ width, height, className: 'sigCanvas' }}
                    onEnd={handleEnd}
                />
            </div>
            <button type="button" onClick={clear} style={{ fontSize: '0.8rem', color: '#666', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>
                مسح التوقيع
            </button>
        </div>
    );
}
