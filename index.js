class Heap {
    constructor() { this.heap = [-1]; }

    isgreater(node1, node2) {
        if (typeof node1 === 'number') return node1 > node2;
        if (typeof node1 === 'object' && typeof node2 === 'object') {
            if (node1[0] === node2[0]) return node1[1] > node2[1];
            return node1[0] > node2[0];
        }
        return false;
    }

    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    size() { return this.heap.length; }
    isempty() { return this.size() <= 1; }

    insert(data) {
        let index = this.size();
        this.heap.push(data);
        let parent = Math.floor(index / 2);
        while (parent >= 1 && this.isgreater(this.heap[parent], this.heap[index])) {
            this.swap(parent, index);
            index = parent;
            parent = Math.floor(index / 2);
        }
    }

    extract() {
        if (this.size() === 2) return this.heap.pop();
        const ans = this.heap[1];
        this.heap[1] = this.heap.pop();
        let index = 1;
        while (index * 2 < this.size()) {
            let left = index * 2, right = index * 2 + 1, temp = index;
            if (left < this.size() && this.isgreater(this.heap[temp], this.heap[left])) temp = left;
            if (right < this.size() && this.isgreater(this.heap[temp], this.heap[right])) temp = right;
            if (temp === index) break;
            this.swap(index, temp);
            index = temp;
        }
        return ans;
    }
}

class Encode {
    constructor(data) {
        this.original_text = data;
        this.encrypted_text = "";
        this.rem = 0;
        this.tree = "";
        this.freq = {};
        this.path = {};
    }

    getMapping(node, path) {
        if (typeof node[1] === "string" || node.length === 1) {
            this.path[node[1]] = path;
            return;
        }
        this.getMapping(node[1][0], path + '0');
        this.getMapping(node[1][1], path + '1');
    }

    stringify() {
        this.tree = "";
        for (let key in this.path) {
            this.tree += this.path[key] + "|" + key;
        }
    }

    encrypt(binaryString) {
        this.rem = (8 - (binaryString.length % 8)) % 8;
        binaryString += '0'.repeat(this.rem);
        let bytes = [];
        for (let i = 0; i < binaryString.length; i += 8) {
            let byte = binaryString.substr(i, 8);
            bytes.push(String.fromCharCode(parseInt(byte, 2)));
        }
        this.encrypted_text = btoa(bytes.join('')); // Base64-safe
    }

    getBinaryText() {
        let binaryString = "";
        for (let i = 0; i < this.original_text.length; i++) {
            binaryString += this.path[this.original_text[i]];
        }
        this.encrypt(binaryString);
    }

    encode() {
        for (let char of this.original_text) {
            this.freq[char] = (this.freq[char] || 0) + 1;
        }

        const heap = new Heap();
        for (let key in this.freq) heap.insert([this.freq[key], key]);
        while (heap.size() > 2) {
            let first = heap.extract(), second = heap.extract();
            heap.insert([first[0] + second[0], [first, second]]);
        }

        this.getMapping(heap.heap[1], "");
        this.stringify();
        this.getBinaryText();
        return this.encrypted_text + "\t" + this.rem + "\t" + this.tree;
    }
}

class Decode {
    constructor(encoded) {
        const [encrypted_text, rem, tree] = encoded.split("\t");
        this.encrypted_text = encrypted_text;
        this.rem = parseInt(rem);
        this.tree = tree;
        this.binaryText = "";
        this.original_text = "";
        this.path = {};
    }

    getPath() {
        let i = 0;
        while (i < this.tree.length) {
            let code = "";
            while (i < this.tree.length && this.tree[i] !== '|') code += this.tree[i++];
            i++;
            if (i < this.tree.length) this.path[code] = this.tree[i++];
        }
    }

    getBinaryText() {
        let decoded = atob(this.encrypted_text);
        this.binaryText = "";
        for (let ch of decoded) {
            this.binaryText += ch.charCodeAt(0).toString(2).padStart(8, '0');
        }
        if (this.rem) this.binaryText = this.binaryText.slice(0, -this.rem);
    }

    getOriginal() {
        let temp = "";
        for (let bit of this.binaryText) {
            temp += bit;
            if (temp in this.path) {
                this.original_text += this.path[temp];
                temp = "";
            }
        }
    }

    decode() {
        this.getPath();
        this.getBinaryText();
        this.getOriginal();
        return this.original_text;
    }
}

function encodeFile(data) {
    return new Encode(data).encode();
}

function decodeFile(encoded) {
    return new Decode(encoded).decode();
}

// ------------------ UI ------------------
window.onload = function () {
    const upload = document.getElementById("upload");
    const encodeResults = document.getElementById("encode-results");
    const decodeResults = document.getElementById("decode-results");
    const encodeBtn = document.getElementById("encode");
    const decodeBtn = document.getElementById("decode");
    const upload_label = document.getElementById("upload_lable");
    const resetButton = document.getElementById("reset");

    function download(fileName, data) {
        // Create a Blob from the string
        const blob = new Blob([data], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();

        // Release the object URL after download
        URL.revokeObjectURL(url);
    }


    upload.addEventListener("change", () => {
        upload_label.innerText = upload.files[0].name;
        encodeResults.innerHTML = "";
        decodeResults.innerHTML = "";
    });

   encode.onclick = function() {
        encodeResults.innerHTML = "";
        decodeResults.innerHTML = "";

        const uploadedFile = upload.files[0]; // use a consistent name

        if (!uploadedFile) {
            encodeResults.innerHTML = "<h2>❌ FILE NOT UPLOADED</h2><p>Please upload a text file to compress.</p>";
            return;
        }

        const fileReader = new FileReader();
        fileReader.onload = function(fileLoadEvent) {
            const data = fileLoadEvent.target.result;
            if (data.length === 0) {
                encodeResults.innerHTML = "<h2>❌ EMPTY FILE</h2><p>The uploaded file contains no data.</p>";
                return;
            }

            var encoder = new Encode(data);
            var encodedText = encoder.encode();

            const originalSize = data.length;
            const encodedSize = encodedText.length;
            const ratio = (originalSize / encodedSize).toFixed(2);
            const reduction = (((originalSize - encodedSize) / originalSize) * 100).toFixed(2);

            encodeResults.innerHTML = `
                <h2>✅ ENCODING COMPLETE</h2>
                <p><strong>File Name:</strong> ${uploadedFile.name}</p>
                <table class="result-table">
                    <tr><th>Original Size (chars)</th><td>${originalSize}</td></tr>
                    <tr><th>Encoded Size (chars)</th><td>${encodedSize}</td></tr>
                    <tr><th>Compression Ratio</th><td>${ratio}:1</td></tr>
                    <tr><th>Size Reduction</th><td>${reduction}%</td></tr>
                </table>
                <p>The encoded file has been successfully downloaded as <strong>${uploadedFile.name.split(".").slice(0, -1).join(".")}_Encoded.txt</strong>.</p>
            `;

            download(uploadedFile.name.split(".").slice(0, -1).join(".") + "_Encoded.txt", encodedText);
        }

        fileReader.readAsText(uploadedFile, "UTF-8");
    }

    decode.onclick = function() {
        encodeResults.innerHTML = "";
        decodeResults.innerHTML = "";

        const uploadedFile = upload.files[0]; // consistently named

        if (!uploadedFile) {
            decodeResults.innerHTML = "<h2>❌ FILE NOT UPLOADED</h2><p>Please upload the encoded file to decode.</p>";
            return;
        }

        const fileReader = new FileReader();
        fileReader.onload = function(fileLoadEvent) {
            const data = fileLoadEvent.target.result;

            if (!data || data.length === 0) {
                decodeResults.innerHTML = "<h2>❌ EMPTY FILE</h2><p>The uploaded file contains no data.</p>";
                return;
            }

            if (data.indexOf('\t') === -1) {
                decodeResults.innerHTML = "<h2>❌ DECODE FAILED</h2><p>The uploaded file is not in the expected encoded format. Did you upload an unencoded text file?</p>";
                return;
            }

            try {
                const decoder = new Decode(data);
                const decodedText = decoder.decode();

                decodeResults.innerHTML = `
                    <h2>✅ DECODING COMPLETE</h2>
                    <p><strong>Encoded File Name:</strong> ${uploadedFile.name}</p>
                    <p>The original text has been successfully restored and downloaded.</p>
                    <p>Please check your downloads folder for the file: <strong>${uploadedFile.name.split(".").slice(0, -1).join(".")}_Original.txt</strong></p>
                `;

                download(uploadedFile.name.split(".").slice(0, -1).join(".") + "_Original.txt", decodedText);
            } catch (e) {
                decodeResults.innerHTML = `
                    <h2>❌ DECODING FAILED</h2>
                    <p>An internal error occurred during decoding. Ensure the file was generated by the Encode button.</p>
                    <p>Error: ${e.message}</p>
                `;
            }
        }

        fileReader.readAsText(uploadedFile, "UTF-8");
    }



    resetButton.onclick = function () {
        upload.value = null;
        upload_label.innerText = "Upload Text File";
        encodeResults.innerHTML = "";
        decodeResults.innerHTML = "";
    }
}
