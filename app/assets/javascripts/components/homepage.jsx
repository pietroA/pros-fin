class UserHomePage extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        return(
            <div>
                <header className="jumbotron text-center">
                    <h2><small>Bentornato</small> { this.props.current_user.username}</h2>
                </header>
                <UserReports current_user={this.props.current_user} />
            </div>
            );            
    }
}
