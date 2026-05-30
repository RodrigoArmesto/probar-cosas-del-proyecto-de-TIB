/**
 * Función para asegurar independencia de los tests de samples 
 * y no depender de otro test para tener un token de sesión válido
 */
 async function okLogin()
 {
    // 1. Login como productor (pepe) para obtener un token válido
     const response = await fetch('/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ username: 'pepe', password: '12345' }) // Usamos pepe hardcodeado
     });
     const data = await response.json();
     // Guardamos el token para tests de samples
     localStorage.setItem('test_token', data.token);
 }

/**
 * Test: GET /api/samples/my-samples
 */
 testUtils.createTestButton("Test Listar Mis Samples", async (btn) => {
    // 1. Asegurar y guardar una sesión válida
    await okLogin();
    const token = localStorage.getItem('test_token');
    
    // 2. Realizar la petición
    const response = await fetch('/api/samples/my-samples', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    testUtils.log(data);
    if (response.ok) 
        testUtils.setSuccess(btn);
});

/**
 * Test: POST /api/samples/upload (Simulado)
 */
testUtils.createTestButton("Test Subir Sample (Simulado)", async (btn) => {
    // 1. Asegurar y guardar una sesión válida
    await okLogin();
    const token = localStorage.getItem('test_token');
    
    // Creamos un FormData
    const formData = new FormData();
    formData.append('display_name', 'Test Loop Pedagogico');
    formData.append('category', 'Drums');
    formData.append('bpm', '120');

    // Simulamos un archivo WAV (binario vacío para la prueba)
    const blob = new Blob(["Simulated Audio Content"], { type: 'audio/wav' });
    formData.append('audioFile', blob, 'DRUM_LOOP_01.wav');

    const response = await fetch('/api/samples/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    const data = await response.json();
    testUtils.log(data);
    if (response.ok) 
        testUtils.setSuccess(btn);
});




// EJERCICIOS DE LA GUÍA

testUtils.createTestButton("Test Seguridad - Productor accediendo a Admin", async (btn) => {
    //Inicio sesion como pepe y guardo el token de sesion
    await okLogin();
    const token = localStorage.getItem('test_token');

    // 2. Realizar la petición
    const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    testUtils.log(data);
    if (response.status === 403)
        testUtils.setSuccess(btn);
});


testUtils.createTestButton("Test Eliminar Sample Dinámico", async (btn) => {
    //Inicio sesion como pepe y guardo el token de sesion
    await okLogin();
    const token = localStorage.getItem('test_token');

    //Realizar la petición
    const response = await fetch('/api/samples/my-samples', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    if (data.length === 0) {
        testUtils.log("Advertencia: Para borrar un sample, se debe subir primero.");
    }
    else {
        // Hay samples: extraemos el id del primer elemento 
        const targetId = data[0].id;

        // Consigna: Utilizar testUtils.log() para mostrar qué ID se intenta borrar [cite: 124]
        testUtils.log(`Intentando borrar el ID específico: ${targetId}`);

        // 4. Ejecutar Eliminación: Petición DELETE inyectando el ID obtenido 
        const responseDelete = await fetch(`/api/samples/${targetId}`, { // 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const dataDelete = await responseDelete.json(); // [cite: 133]
        testUtils.log(dataDelete);

        if (responseDelete.ok) 
            testUtils.setSuccess(btn);
    }
});


testUtils.createTestButton("Test Subir Sample - Error por Datos Faltantes", async (btn) => {   
    //Inicio sesion como pepe y guardo el token de sesion
    await okLogin();
    const token = localStorage.getItem('test_token');

    // Creo un FormData sin el campo category
    const formData = new FormData();
    formData.append('display_name', 'Test Loop Pedagogico');
    formData.append('bpm', '180');

    // Simulo un archivo WAV (binario vacío para la prueba)
    const blob = new Blob(["Simulated Audio Content"], { type: 'audio/wav' });
    formData.append('audioFile', blob, 'DRUM_LOOP_01.wav');

    // Realizo la petición
    const response = await fetch('/api/samples/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    const data = await response.json();
    testUtils.log(data);

    if (response.status === 400) 
        testUtils.setSuccess(btn);
});