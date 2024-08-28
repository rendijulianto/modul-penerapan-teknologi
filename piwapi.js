class PiwapiService {
    constructor(apiKey, deviceId) {
        this.apiKey = apiKey;
        this.deviceId = deviceId;
    }

    async sendMessageWhatsapp(data) {
        let form = new FormData();
        form.append("secret", this.apiKey);
        form.append("account", this.deviceId);
        form.append("recipient", data.recipient);
    
        if (data.media_file && data.media_file.length > 0) {
            const file = data.media_file[0];
            form.append("media_file", file);
            form.append("type", "media");
    
            if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/gif') {
                form.append("media_type", "image");
            } else if (file.type.startsWith('video/')) {
                form.append("media_type", "video");
            } else if (file.type.startsWith('audio/')) {
                form.append("media_type", "audio");
            } else {
                form.append("media_type", "unknown"); // Tambahkan tipe default jika tipe file tidak dikenali
            }
        } else if (data.document_file) {
            form.append("type", "document");
            form.append("document_file", data.document_file[0]);
            form.append("document_name", data.document_name[0]);
            form.append("document_type", data.document_type);
        } else {
            form.append("type", "text");
        }
        form.append("message", data.message ?? "");
        try {
            const response = await fetch('https://piwapi.com/api/send/whatsapp', {
                method: "POST",
                body: form
            });
            return response.json();
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    }
    

    async validateNumber(number) {
        const url = `https://piwapi.com/api/validate/whatsapp?secret=${this.apiKey}&unique=${this.deviceId}&phone=${number}`;
        const response = await fetch(url);
        return response.json();
    }
}
