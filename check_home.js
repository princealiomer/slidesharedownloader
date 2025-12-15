
async function check() {
    try {
        const response = await fetch("http://localhost:3000");
        console.log("Homepage Status:", response.status);
        if (response.status !== 200) {
            console.log("Body:", (await response.text()).substring(0, 500));
        }
    } catch (e) {
        console.error("Connection failed:", e.message);
    }
}

check();
