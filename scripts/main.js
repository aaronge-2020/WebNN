const backend = 'webgl'; // 'cpu' or 'wasm'
    const context = await navigator.ml.createContext();
    const tf = context.tf;
    await tf.setBackend(backend);
    await tf.ready();