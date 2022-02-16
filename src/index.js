import React from 'react';
import ReactDOM from 'react-dom';
import Web3 from 'web3';
import abi from './abi';
import './index.css';

const contractAddress = "0x431d5D108c1F437DACdfdD713a2c273aC04cF893";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: null,
      account: null,
      contracts: {},
      prize: 0,
      numbers: "",
      raffledNumbers: "",
    }

    this.handleSubmitBet = this.handleSubmitBet.bind(this);
    this.handleSubmitRaffle = this.handleSubmitRaffle.bind(this);
    this.handleSubmitClaim = this.handleSubmitClaim.bind(this);
  }

  componentDidMount() {
    this.init();
  }

  async init() {
    if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({ // Requisita primeiro acesso ao Metamask
            method: "eth_requestAccounts",
          });
          this.setState({ account: accounts[0] });
          window.ethereum.on('accountsChanged', this.updateAccount); // Atualiza se o usuário trcar de conta no Metamaslk
        } catch (error) {
          console.error("Usuário negou acesso ao web3!");
          return;
        }
        this.setState({ web3: new Web3(window.ethereum) });
    } else {
        console.error("Instalar MetaMask!");
        return;
    }

    this.initContract();
}

  //Atualiza a conta ativa no metamax
  async updateAccount(){
      this.setState({ account: (await this.state.web3.eth.getAccounts())[0] });
  }

  // Associa ao endereço do seu contrato
  async initContract () {
      var newContracts = {...this.state.contracts};
      newContracts.Megasena = new this.state.web3.eth.Contract(abi, contractAddress);
      this.setState({ contracts: newContracts });
      this.setState({ prize: await this.state.contracts.Megasena.methods.getPrize().call()});
      var num = await this.state.contracts.Megasena.methods.getPlayerNumbers(this.state.account).call();
      this.setState({ numbers: num.map((e) => {
        return e + ' '
      }) });
      var num_ = await this.state.contracts.Megasena.methods.getRaffledNumbers().call();
      this.setState({ raffledNumbers: num_.map((e) => {
        return e + ' '
      }) });
  }

  async updateInfo() {
    this.setState({ prize: await this.state.contracts.Megasena.methods.getPrize().call()});
    this.setState({ numbers: await this.state.contracts.Megasena.methods.getPlayerNumbers(this.state.account).call()});
  }

  async updateInfoRaffle() {
    var num = await this.state.contracts.Megasena.methods.getRaffledNumbers().call();
      this.setState({ raffledNumbers: num.map((e) => {
        return e + ' '
      })});
  }

  handleSubmitBet(e) {
    e.preventDefault();

    var n = this.state.numbers.split(',').map((item) => {
      return parseInt(item, 10);
    })
    console.log(n);
    console.log(this.state.contracts.Megasena.methods.bet(n).send({
      from: this.state.account, value: "10000"
    }).then(this.updateInfo()));
  }

  handleSubmitRaffle(e) {
    e.preventDefault();
    console.log(this.state.contracts.Megasena.methods.raffle().send({
      from: this.state.account, value: "10"
    }).then(this.updateInfoRaffle()));
  }

  handleSubmitClaim(e) {
    e.preventDefault();

    console.log(
      this.state.contracts.Megasena.methods.claimPrize().send({
        from: this.state.account, value: "0"
      })
    );
  }

  render() {
    return (
      <div>
        <div className='header'>
          Mega sena
        </div>
        <div>
          <h2> Valor do prêmio: {this.state.prize} </h2>
        </div>
        <div>
          <h2> Números do usuário: {this.state.numbers} </h2>
        </div>
        <div>
          <form onSubmit={this.handleSubmitBet}>
            <input type="text" onChange={e => {
              this.setState({ numbers: e.target.value })
            }}/>
            <button type='submit' className='button' onClick={this.handleSubmitBet}> Fazer aposta! </button>
          </form>
        </div>
        <div>
          <h2> Números sorteados: {this.state.raffledNumbers}</h2>
        </div>
        <div>
        <form onSubmit={this.handleSubmitRaffle}>
            <button type='submit' className='button' onClick={this.handleSubmitRaffle}> Sortear! </button>
          </form>
        </div>
        <div>
        <form onSubmit={this.handleSubmitClaim}>
            <button type='submit' className='button' onClick={this.handleSubmitClaim}> Clamar prêmio! </button>
          </form>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

