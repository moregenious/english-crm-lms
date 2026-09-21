"""
Windows Media Foundation WMA to WAV Transcoder
Enables seamless playback of Microsoft WMA audio in modern web browsers by decoding to PCM WAV.
Uses native Windows system DLLs (mfplat.dll, mfreadwrite.dll) without external dependencies or compilers.
"""

import ctypes
import os
import sys
import wave

class WMATranscoder:
    _initialized = False

    @classmethod
    def _init_mf(cls):
        if cls._initialized:
            return
        cls.ole32 = ctypes.windll.ole32
        cls.mfplat = ctypes.windll.mfplat
        cls.mfreadwrite = ctypes.windll.mfreadwrite

        cls.ole32.CoTaskMemFree.argtypes = [ctypes.c_void_p]
        cls.ole32.CoTaskMemFree.restype = None

        cls.mfplat.MFStartup.argtypes = [ctypes.c_uint32, ctypes.c_uint32]
        cls.mfplat.MFStartup.restype = ctypes.c_long

        cls.mfplat.MFShutdown.argtypes = []
        cls.mfplat.MFShutdown.restype = ctypes.c_long

        cls.mfplat.MFCreateMediaType.argtypes = [ctypes.POINTER(ctypes.c_void_p)]
        cls.mfplat.MFCreateMediaType.restype = ctypes.c_long

        class WAVEFORMATEX(ctypes.Structure):
            _pack_ = 1
            _fields_ = [
                ('wFormatTag', ctypes.c_ushort),
                ('nChannels', ctypes.c_ushort),
                ('nSamplesPerSec', ctypes.c_uint32),
                ('nAvgBytesPerSec', ctypes.c_uint32),
                ('nBlockAlign', ctypes.c_ushort),
                ('wBitsPerSample', ctypes.c_ushort),
                ('cbSize', ctypes.c_ushort)
            ]
        cls.WAVEFORMATEX = WAVEFORMATEX

        cls.mfplat.MFInitMediaTypeFromWaveFormatEx.argtypes = [ctypes.c_void_p, ctypes.POINTER(WAVEFORMATEX), ctypes.c_uint32]
        cls.mfplat.MFInitMediaTypeFromWaveFormatEx.restype = ctypes.c_long

        cls.mfplat.MFCreateWaveFormatExFromMFMediaType.argtypes = [ctypes.c_void_p, ctypes.POINTER(ctypes.c_void_p), ctypes.POINTER(ctypes.c_uint32), ctypes.c_uint32]
        cls.mfplat.MFCreateWaveFormatExFromMFMediaType.restype = ctypes.c_long

        cls.mfreadwrite.MFCreateSourceReaderFromURL.argtypes = [ctypes.c_wchar_p, ctypes.c_void_p, ctypes.POINTER(ctypes.c_void_p)]
        cls.mfreadwrite.MFCreateSourceReaderFromURL.restype = ctypes.c_long

        cls._initialized = True

    @staticmethod
    def _call_vtable(ptr, index, restype, argtypes, *args):
        vtable = ctypes.cast(ptr, ctypes.POINTER(ctypes.c_void_p)).contents.value
        func_ptr = ctypes.cast(vtable + index * ctypes.sizeof(ctypes.c_void_p), ctypes.POINTER(ctypes.c_void_p)).contents.value
        func = ctypes.WINFUNCTYPE(restype, *argtypes)(func_ptr)
        return func(*args)

    @classmethod
    def convert_wma_to_wav(cls, input_wma_path, output_wav_path):
        """
        Converts a WMA audio file to an uncompressed WAV file playable in any modern browser.
        Returns True on success, raises RuntimeError or Exception on failure.
        """
        cls._init_mf()
        input_abs = os.path.abspath(input_wma_path)
        output_abs = os.path.abspath(output_wav_path)

        if not os.path.exists(input_abs):
            raise FileNotFoundError(f"Input WMA file not found: {input_abs}")

        # CoInitialize
        cls.ole32.CoInitializeEx(None, 0)
        MF_VERSION = 0x00020070
        hr_startup = cls.mfplat.MFStartup(MF_VERSION, 0)
        if hr_startup != 0:
            cls.ole32.CoUninitialize()
            raise RuntimeError(f"MFStartup failed: {hex(hr_startup & 0xFFFFFFFF)}")

        pReader = ctypes.c_void_p()
        pNativeType = ctypes.c_void_p()
        pNativeWf = ctypes.c_void_p()
        pType = ctypes.c_void_p()
        pCurrentType = ctypes.c_void_p()
        pWf = ctypes.c_void_p()

        try:
            hr = cls.mfreadwrite.MFCreateSourceReaderFromURL(input_abs, None, ctypes.byref(pReader))
            if hr != 0 or not pReader.value:
                raise RuntimeError(f"MFCreateSourceReaderFromURL failed for {input_abs}: {hex(hr & 0xFFFFFFFF)}")

            MF_SOURCE_READER_ALL_STREAMS = 0xFFFFFFFE
            MF_SOURCE_READER_FIRST_AUDIO_STREAM = 0xFFFFFFFD

            # Select first audio stream
            cls._call_vtable(pReader.value, 4, ctypes.c_long, [ctypes.c_void_p, ctypes.c_uint32, ctypes.c_int], pReader.value, MF_SOURCE_READER_ALL_STREAMS, 0)
            cls._call_vtable(pReader.value, 4, ctypes.c_long, [ctypes.c_void_p, ctypes.c_uint32, ctypes.c_int], pReader.value, MF_SOURCE_READER_FIRST_AUDIO_STREAM, 1)

            # Query native stream media type
            hr = cls._call_vtable(pReader.value, 5, ctypes.c_long, [ctypes.c_void_p, ctypes.c_uint32, ctypes.c_uint32, ctypes.POINTER(ctypes.c_void_p)],
                                  pReader.value, MF_SOURCE_READER_FIRST_AUDIO_STREAM, 0, ctypes.byref(pNativeType))
            if hr != 0 or not pNativeType.value:
                raise RuntimeError(f"GetNativeMediaType failed: {hex(hr & 0xFFFFFFFF)}")

            nativeCbSize = ctypes.c_uint32()
            cls.mfplat.MFCreateWaveFormatExFromMFMediaType(pNativeType.value, ctypes.byref(pNativeWf), ctypes.byref(nativeCbSize), 0)
            nativeWf = ctypes.cast(pNativeWf.value, ctypes.POINTER(cls.WAVEFORMATEX)).contents

            # Configure Target PCM MediaType
            cls.mfplat.MFCreateMediaType(ctypes.byref(pType))
            targetWf = cls.WAVEFORMATEX()
            targetWf.wFormatTag = 1 # WAVE_FORMAT_PCM
            targetWf.nChannels = nativeWf.nChannels if nativeWf.nChannels > 0 else 2
            targetWf.nSamplesPerSec = nativeWf.nSamplesPerSec if nativeWf.nSamplesPerSec > 0 else 44100
            targetWf.wBitsPerSample = 16
            targetWf.nBlockAlign = (targetWf.nChannels * targetWf.wBitsPerSample) // 8
            targetWf.nAvgBytesPerSec = targetWf.nSamplesPerSec * targetWf.nBlockAlign
            targetWf.cbSize = 0

            cls.mfplat.MFInitMediaTypeFromWaveFormatEx(pType.value, ctypes.byref(targetWf), ctypes.sizeof(targetWf))

            # Set output media type to PCM
            hr = cls._call_vtable(pReader.value, 7, ctypes.c_long, [ctypes.c_void_p, ctypes.c_uint32, ctypes.c_void_p, ctypes.c_void_p],
                                  pReader.value, MF_SOURCE_READER_FIRST_AUDIO_STREAM, None, pType.value)
            if hr != 0:
                raise RuntimeError(f"SetCurrentMediaType to PCM failed: {hex(hr & 0xFFFFFFFF)}")

            # Verify current output media type
            cls._call_vtable(pReader.value, 6, ctypes.c_long, [ctypes.c_void_p, ctypes.c_uint32, ctypes.POINTER(ctypes.c_void_p)],
                             pReader.value, MF_SOURCE_READER_FIRST_AUDIO_STREAM, ctypes.byref(pCurrentType))
            cbSize = ctypes.c_uint32()
            cls.mfplat.MFCreateWaveFormatExFromMFMediaType(pCurrentType.value, ctypes.byref(pWf), ctypes.byref(cbSize), 0)
            wf = ctypes.cast(pWf.value, ctypes.POINTER(cls.WAVEFORMATEX)).contents

            # Read all PCM frames
            pcm_chunks = []
            actual_stream = ctypes.c_uint32()
            stream_flags = ctypes.c_uint32()
            timestamp = ctypes.c_int64()

            while True:
                pSample = ctypes.c_void_p()
                hr = cls._call_vtable(pReader.value, 9, ctypes.c_long, [
                    ctypes.c_void_p, ctypes.c_uint32, ctypes.c_uint32,
                    ctypes.POINTER(ctypes.c_uint32), ctypes.POINTER(ctypes.c_uint32),
                    ctypes.POINTER(ctypes.c_int64), ctypes.POINTER(ctypes.c_void_p)
                ], pReader.value, MF_SOURCE_READER_FIRST_AUDIO_STREAM, 0, ctypes.byref(actual_stream), ctypes.byref(stream_flags), ctypes.byref(timestamp), ctypes.byref(pSample))

                # MF_SOURCE_READERF_ENDOFSTREAM = 0x00000002
                if hr != 0 or (stream_flags.value & 0x00000002) != 0:
                    if pSample.value:
                        cls._call_vtable(pSample.value, 2, ctypes.c_ulong, [ctypes.c_void_p], pSample.value)
                    break

                if pSample.value:
                    # IMFSample::ConvertToContiguousBuffer index 41
                    pBuffer = ctypes.c_void_p()
                    hr_buf = cls._call_vtable(pSample.value, 41, ctypes.c_long, [ctypes.c_void_p, ctypes.POINTER(ctypes.c_void_p)], pSample.value, ctypes.byref(pBuffer))
                    if hr_buf == 0 and pBuffer.value:
                        # IMFMediaBuffer::Lock index 3
                        pBytes = ctypes.c_void_p()
                        max_len = ctypes.c_uint32()
                        cur_len = ctypes.c_uint32()
                        cls._call_vtable(pBuffer.value, 3, ctypes.c_long, [ctypes.c_void_p, ctypes.POINTER(ctypes.c_void_p), ctypes.POINTER(ctypes.c_uint32), ctypes.POINTER(ctypes.c_uint32)],
                                         pBuffer.value, ctypes.byref(pBytes), ctypes.byref(max_len), ctypes.byref(cur_len))
                        if cur_len.value > 0 and pBytes.value:
                            pcm_chunks.append(ctypes.string_at(pBytes.value, cur_len.value))
                        # Unlock index 4
                        cls._call_vtable(pBuffer.value, 4, ctypes.c_long, [ctypes.c_void_p], pBuffer.value)
                        # Release buffer index 2
                        cls._call_vtable(pBuffer.value, 2, ctypes.c_ulong, [ctypes.c_void_p], pBuffer.value)

                    # Release sample index 2
                    cls._call_vtable(pSample.value, 2, ctypes.c_ulong, [ctypes.c_void_p], pSample.value)

            raw_pcm = b"".join(pcm_chunks)

            # Write WAV file
            os.makedirs(os.path.dirname(output_abs), exist_ok=True)
            with wave.open(output_abs, "wb") as wav_out:
                wav_out.setnchannels(wf.nChannels)
                wav_out.setsampwidth(wf.wBitsPerSample // 8)
                wav_out.setframerate(wf.nSamplesPerSec)
                wav_out.writeframes(raw_pcm)

            return True

        finally:
            if pWf.value: cls.ole32.CoTaskMemFree(pWf)
            if pNativeWf.value: cls.ole32.CoTaskMemFree(pNativeWf)
            if pCurrentType.value: cls._call_vtable(pCurrentType.value, 2, ctypes.c_ulong, [ctypes.c_void_p], pCurrentType.value)
            if pNativeType.value: cls._call_vtable(pNativeType.value, 2, ctypes.c_ulong, [ctypes.c_void_p], pNativeType.value)
            if pType.value: cls._call_vtable(pType.value, 2, ctypes.c_ulong, [ctypes.c_void_p], pType.value)
            if pReader.value: cls._call_vtable(pReader.value, 2, ctypes.c_ulong, [ctypes.c_void_p], pReader.value)
            cls.mfplat.MFShutdown()
            cls.ole32.CoUninitialize()

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        in_p = sys.argv[1]
        out_p = sys.argv[2]
    else:
        in_p = "uploads/6d304f80_Song.wma"
        out_p = "uploads/6d304f80_Song.wav"
    
    print(f"Converting {in_p} -> {out_p}...")
    WMATranscoder.convert_wma_to_wav(in_p, out_p)
    print(f"SUCCESS: Output WAV size = {os.path.getsize(out_p)} bytes")
