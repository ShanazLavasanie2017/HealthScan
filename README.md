
A Blazor WebAssembly application integrated with [Shenai SDK] for health diagnostics (blood pressure scanning).  
**Note:** Currently debugging video streaming and memory allocation issues during scans.

## ⚠️ Known Issues
1. **Chrome/Edge**: Video feed shows green rectangle (WebRTC initialization failure).  
2. **Firefox**: Video loads but BP scan freezes with `memory_pool.cpp:61` errors.  
3. Memory spikes (~1.5GB) during scans in Blazor WASM.

 
 
