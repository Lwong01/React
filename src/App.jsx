import React, {Component} from 'react';
import MessageList from './MessageList.jsx';
import ChatBar from './ChatBar.jsx';
const uuidv1 = require('uuid/v1');

export default class App extends Component {
  constructor(props) {
    super(props);

    // this is the *only* time you should assign directly to state:
    this.state = {
      currentUser: {
       name: "Bob"},

       messages: [],
       numbers: 0
  }

    this.addMessage = this.addMessage.bind(this);
    this.changeUser = this.changeUser.bind(this);
  }

  //creating a new message
  addMessage(newMessage) {
    //Creating a variable that has an objext
    const msg = {
      type: "postMessage",
      username: this.state.currentUser.name,
      content: newMessage
    };
    this.webSocket.send(JSON.stringify(msg)); //you need to send it as a string because you can only send strings and NOTHING else. Then you parse it back into an object when the server gets it.
  }

  //changing the user. It will show that you have changed the user on the chat box as well.
  changeUser(newUser){

      const createdUser = {
        type: "postNotification",
        content: this.state.currentUser.name + " has been changed to " + newUser
      }

  //once you change the user, we will set the current user as the new user
    this.setState({
        currentUser: {name: newUser}
    })
    this.webSocket.send(JSON.stringify(createdUser));
  }

  componentDidMount() {
    this.webSocket = new WebSocket("ws://localhost:3001");
    this.webSocket.onopen = (event) =>{
      console.log("Connected to server");
    };

    //we get the message through the onmessage
    this.webSocket.onmessage = (event) => {

      //receive the messages from the websocket and add it to the current messages
      //and then set theState to refresh the component.
      const parsed = JSON.parse(event.data);


      switch (parsed.type) {
        case "incomingMessage":
          const messages = this.state.messages.concat(parsed);
          this.setState({ messages: messages })
          break;
        case "incomingNotification":
          const notification = this.state.messages.concat(parsed);
          this.setState({messages:notification})

          break;
        case "incomingUsers":
        console.log(parsed.clientsNumber);
         this.setState({numbers: Number(parsed.clientsNumber)})
         console.log(this.state);
        //console.log("Number of users: ",parsed.clientsNumber);
          break;
        default:
          // show an error in the console if the message type is unknown
          throw new Error("Unknown event type " + parsed.type);
      }
    }
    console.log("componentDidMount <App />");

  }

  render() {
    return (
      <div>
          <div className="counter">
            {this.state.numbers} user online
          </div>
        <div>
          <MessageList messages={this.state.messages} />
        </div>

        <div>
          <ChatBar username={this.state.currentUser.name} addMessage={this.addMessage} changeUser={this.changeUser} />
        </div>
      </div>

    );
  }
}
// export default App;
