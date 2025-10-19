class Heap{
    constructor()
    {
        this.heap=[-1];
    }
    isgreater(node1,node2)
    {
        if(typeof(node1)==='number')
        return node1>node2;
        if(typeof(node1)==='object'&&typeof(node2)==='object')
        {
            if(node1[0]==node2[0])
            return node1[1]>node2[1];
            return node1[0]>node2[0];
            
        }
        return false;
    }
    swap(parent_index,index)
    {
        let temp=this.heap[parent_index];
        this.heap[parent_index]=this.heap[index];
        this.heap[index]=temp;
    }
    size()
    {
        return this.heap.length;
    }
    isempty()
    {
        return this.size()<=1;
    }
    insert(data)
    {
        let arr=this.heap;
        var index=this.size();
        this.heap.push(data);
        var parent_index=Math.floor(index/2);
        while(parent_index>=1)
        {
            if(this.isgreater(this.heap[parent_index],this.heap[index]))
            {
                this.swap(parent_index,index);
                index=parent_index;
                parent_index=Math.floor(index/2);
                continue;
            }
            break;
        }
    }
    extract()
    {
        if(this.size()===2)
        {
            let ans=this.heap.pop();
            return ans;
        }
        var ans=this.heap[1];
        var last_element=this.heap.pop();
        this.heap[1]=last_element;
        var index=1;
        while(index*2<this.size()||index*2+1<this.size())
        {
            let left=index*2,right=index*2+1,temp=index;
            if(this.isgreater(this.heap[temp],this.heap[left]))
            temp=left;
            
            if(this.isgreater(this.heap[temp],this.heap[right]))
            temp=right;
            
            if(temp!=index)
            {
                this.swap(temp,index);
                index=temp;
            }
            else
            break;

        }



        return ans;
    }
}

class Encode
{
    constructor(data)
    {
        this.original_text=data;
        this.encrypted_text="";
        this.rem=0;
        this.tree="";
        this.freq=new Map();
        this.path=new Map();
    }
    getMapping(node,path)
    {
        if(typeof(node[1])=="string"||node.length==1)
        {
            this.path[node[1]]=path;
            return;
        }
        else
        {
            this.getMapping(node[1][0],path+'0');
            this.getMapping(node[1][1],path+'1');
        }
    }
    stringify()
    {
        for(const key in this.path)
        {
            
            this.tree+=this.path[key]+"|"+key;
        }
    }
    getCoded(string)
    {
        let i=string.length-1,ans=0,mult=1;
        while(i>=0)
        {
            if(string[i]==='1')
            ans+=mult;
            mult*=2;
            i--;
        }
        return String.fromCharCode(ans);
    }
    encrypt(binaryString)
    {
        this.rem=8-binaryString.length%8;
        for(let i=0;i<this.rem;i++)
        binaryString+='0';
        for(let i=0;i<binaryString.length;i+=8)
        {
            let temp=binaryString.substring(i,i+8);
            this.encrypted_text+=this.getCoded(temp);
        }
    }
    getBinaryText()
    {
        let binaryString="",data=this.original_text;
        for(let i=0;i<data.length;i++)
        {
            binaryString+=this.path[data[i]];
        }
        // console.log(data);
        // console.log(binaryString);
        this.encrypt(binaryString);
    }
    encode()
    {
        let data=this.original_text;
        for(let i=0;i<data.length;i++)
        {
            if(data[i] in this.freq)
            this.freq[data[i]]+=1;
            else
            this.freq[data[i]]=1;
        }
        var heap=new Heap();
        for(const key in this.freq)
        {
            heap.insert([this.freq[key],key]);
        }
        // console.log(heap.heap);
        while(heap.size()>2)
        {
            let firstNode=heap.extract(),secondNode=heap.extract();
            heap.insert([firstNode[0]+secondNode[0],[firstNode,secondNode]]);
        }
        // console.log(heap.heap[1]);
        this.getMapping(heap.heap[1],"");
        this.stringify()
        // console.log(this.tree);
        this.getBinaryText();
        // console.log(this.encrypted_text);
        return this.encrypted_text+"\t"+this.rem+"\t"+this.tree;
    }

}

class Decode
{
    constructor(encoded)
    {
        var [encrypted_text,rem,tree]=encoded.split("\t");
        this.encrypted_text=encrypted_text;
        this.rem=rem;
        this.tree=tree;
        this.binaryText="";
        this.original_text="";  
        this.path=new Map();
    }
    getPath()
    {
        var path=new Map();
        var tree=this.tree;
        for(let i=0;i<tree.length;i++)
        {
            var temp="";
            while(tree[i]!='|')
            {
                temp+=tree[i++];
            }
            if(tree[i]=='|')
            {
                i++;
                path[temp]=tree[i];
            }
        }
        this.path=path;
        // console.log("Decode Path",path);
    }
    getBinaryString(n)
    {
        var temp="";
        var i=n;
        while(n)
        {
            
            temp=n%2+temp;
            n=Math.floor(n/2);
        }
        while(temp.length<8)
        {
            temp='0'+temp;
        }
        // console.log("Binary String",temp,i)
        return temp;
    }
    getBinaryText()
    {
        var encrypted_text=this.encrypted_text;
        for(let i=0;i<encrypted_text.length;i++)
        {
            this.binaryText+=this.getBinaryString(encrypted_text.charCodeAt(i));
        }
        // console.log("Decode Binary Text",this.binaryText);
    }
    getOriginal()
    {
        var temp="",binaryText=this.binaryText;
        for(let i=0;i<binaryText.length-this.rem;i++)
        {
            temp+=binaryText[i];
            if(temp in this.path)
            {
                this.original_text+=this.path[temp];
                temp="";
            }
        }
        // console.log(this.original_text);
    }
    decode()
    {
        this.getPath();
        this.getBinaryText();
        this.getOriginal();
        return this.original_text;
    }
}

function encode(data)
{
    var encode=new Encode(data);
    return encode.encode();
}

function decode(onEncode)
{
    var decode=new Decode(onEncode);
    return decode.decode();
}




onload=function()
{
    var upload=document.getElementById("upload")
    var text=document.getElementById("text")
    var encode=document.getElementById("encode")
    var decode=document.getElementById("decode")
    var upload_lable=document.getElementById("upload_lable")

    function download(fileName,data)
    {
        let a=document.createElement("a");
        a.href='data:application/octet-stream,'+encodeURIComponent(data);
        a.download=fileName;
        a.click();
    }



    // upload.addEventListener("change",()=>{alert("File Uploaded")})
    upload.addEventListener("change",()=>{upload_lable.innerText=upload.files[0].name;
    text.innerText=""})
    encode.onclick=function()
    {
        text.innerText="";
        const Uploaded=upload.files[0];
        console.log(Uploaded);
        if(Uploaded===undefined)
        {
            text.innerText="FILE NOT UPLOADED"
        }
        const fileReader=new FileReader();
        fileReader.onload=function(fileLoadEvent)
        {
            const data=fileLoadEvent.target.result;
            if(data.length===0)
            {
                data="No Data";
            }
            var encode=new Encode(data);
            var temp=encode.encode(data);
            text.innerText="The File is comperssed with \n Compression Ratio = "+(data.length/temp.length);
            download(Uploaded.name.split(".")+"_Encoded.txt",temp)
        }
        fileReader.readAsText(Uploaded,"UTF-8");
        Uploaded=undefined;
    }
    decode.onclick=function()
    {
        const Uploaded=upload.files[0];
        if(Uploaded===undefined)
        {
            text.innerText="FILE NOT UPLOADED"
        }
        const fileReader=new FileReader();
        fileReader.onload=function(fileLoadEvent)
        {
            const data=fileLoadEvent.target.result;
            if(data.length===0)
            {
                data="No Data";
            }
            var decode=new Decode(data);
            var temp=decode.decode();
            text.innerText="The Original Text is downloaded";
            download(Uploaded.name.split(".")+"_Original.txt",temp)
        }
        fileReader.readAsText(upload.files[0],"UTF-8");
        Uploaded=undefined;
    }
}   