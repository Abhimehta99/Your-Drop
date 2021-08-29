import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";
import "./App.css";
import moment from 'moment'

//configure ipfs
const ipfsClient=require('ipfs-http-client')
const ipfs=ipfsClient.create({host: 'ipfs.infura.io', port: 5001, protocol: 'https'})

class App extends Component {
  state = {hash:"",size:"",type:"",name:"",description:"",account:"",owner:""};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      this.setState({web3})

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      //create account in state
      this.setState({account:accounts[0]});

      //get network ID
      const networkId = await web3.eth.net.getId();

      // Get the contract instance.
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      this.setState({instance})

      //get count
      const count=await instance.methods.count().call()
      for(let i=count;i>=1;i--){
        const file=await instance.methods.files(i).call()
        this.setState({
          files:[...this.state.files, file]
        })
      }

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  //set states
  constructor(props){
    super(props)
    this.state={
      account:'',
      instance:null,
      files:[],
      type:null,
      name:null
    }
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
    [name]: value
    });
  }

  captureFile=e=>{
    e.preventDefault()

    const file=e.target.files[0]
    const reader=new FileReader()//native file reader of javascript
    reader.readAsArrayBuffer(file)
    reader.onloadend=()=>{
      this.setState({
        buffer:Buffer(reader.result),
        type:file.type,
        name:file.name

      })
    }
  }

   uploadFile=async (e)=>{
    this.setState({description: e})

    //add file to ipfs
    const postResponse=await ipfs.add(this.state.buffer)

    //assign value of file without extension
    if(this.state.type === ''){
      this.setState({type: 'none'})
    }

    const sleep = (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
  }
  
    //upload to blockchain
    this.state.instance.methods.uploadFile(postResponse.path,postResponse.size,this.state.type,this.state.name,e).send({from:this.state.account}).on('transactionHash', async(transactionHash)=>{
      this.setState({
        type:null,
        name:null
      })
      let transactionReceipt = null
        while (transactionReceipt == null) { // Waiting expectedBlockTime until the transaction is mined
            transactionReceipt = await this.state.web3.eth.getTransactionReceipt(transactionHash);
            await sleep(1000)
        }
        window.location.reload();
    })
    .on('error',(e)=>{
      alert('Error')
    })
    
  }

  convertBytes=(bytes) =>{
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
 }


  render() {
    if (!this.state.instance) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="app">
        <p className="Heading">Your Drop</p>
        <form className="container" onSubmit={(event)=>{
          event.preventDefault()
          const description=this.fileDescription.value
          this.uploadFile(description)
        }}>
          
            <div>
              <input
                id="fileDescription"
                type='text'
                ref={(input) => { this.fileDescription = input }}
                placeholder='File Description...'
              />
              <input 
                className="fileInput"
                type="file" 
                onChange={this.captureFile}
              />
              <button>Upload</button>
            </div>
          </form>
          <p>&nbsp;</p>
          <table >
            <thead className="head" style={{'backgroundColor': '#DCDCDC','textTransform': 'uppercase'}} >
              <tr style={{'border': '1px solid black','lineHeight':'40px'}}>
                <th scope="col" style={{'border': '1px solid black'}}>name</th>
                <th scope="col" style={{'border': '1px solid black'}}>description</th>
                <th scope="col" style={{'border': '1px solid black'}}>type</th>
                <th scope="col" style={{'border': '1px solid black'}}>size</th>
                <th scope="col" style={{'border': '1px solid black'}}>date</th>
                <th scope="col" style={{'border': '1px solid black'}}>uploader</th>
                <th scope="col" style={{'border': '1px solid black'}}>view/Share</th>
              </tr>
            </thead>
            {
            this.state.files.filter(file=>file.uploader==this.state.account).map((file, key) => {
              return(
                <thead key={key} style={{'border': '1px solid black'}}>
                  <tr style={{'lineHeight':'30px'}}>
                    <td style={{'border': '1px solid black'}}>{file.fileName}</td>
                    <td style={{'border': '1px solid black'}}>{file.fileDescription}</td>
                    <td style={{'border': '1px solid black'}}>{file.fileType}</td>
                    <td style={{'border': '1px solid black'}}>{this.convertBytes(file.fileSize)}</td>
                    <td style={{'border': '1px solid black'}}>{moment.unix(file.uploadTime).format('h:mm:ss A M/D/Y')}</td>
                    <td style={{'border': '1px solid black'}}>
                      <a
                        href={"https://etherscan.io/address/" + file.uploader}
                        rel="noopener noreferrer"
                        target="_blank">
                        {file.uploader.substring(0,10)}...
                      </a>
                      </td>
                    <td style={{'border': '1px solid black'}}>
                      <a
                        href={"https://ipfs.infura.io/ipfs/" + file.fileHash}
                        rel="noopener noreferrer"
                        target="_blank">
                        {file.fileHash.substring(0,10)}...
                      </a>
                    </td>
                  </tr>
                </thead>
              )
            })
            }
          </table>
      </div>
    );
  }
}

export default App;
