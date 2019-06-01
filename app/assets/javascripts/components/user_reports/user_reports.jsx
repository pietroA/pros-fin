class UserReports extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            user_reports : [],
            user_report : ''
        };
        this.GetUserReports = this.GetUserReports.bind(this);
        this.AddUserReport = this.AddUserReport.bind(this);
        this.ChangeUserReports = this.ChangeUserReports.bind(this);
        this.SelectUserReports = this.SelectUserReports.bind(this);
    }
    componentDidMount(){
        this.GetUserReports();
    }
    GetUserReports(){
        $.ajax({
            url: '/api/user_reports',
            type: 'GET',
            success: (user_reports) => { this.setState({user_reports : user_reports}); },
            error: (xhr, error, status) => { console.log(xhr, error, status); }
        });
    }
    AddUserReport(user_report){
        var user_reports = this.state.user_reports;
        user_reports.unshift(user_report);
        this.setState({ user_reports : user_reports});
        setInterval(()=> { 
            $("#user-report-li-"+user_report.id).trigger("click");
        }, 500);
    }
    ChangeUserReports(old_user_report, new_user_report){
        var user_reports = this.state.user_reports;
        var index = user_reports.indexOf(old_user_report);
        if(new_user_report){
            user_reports.splice(index, 1, new_user_report);
        } else {
            user_reports.splice(index, 1);
        }
        this.setState({ user_reports : user_reports });
    }
    SelectUserReports(user_report){
        this.setState({ user_report: user_report});
    }
    render(){
        var user_reports = [];
        var btn_user_reports = [];

        this.state.user_reports.forEach(user_report => {
            user_reports.push(
                <UserReport key={"user-report-"+user_report.id} 
                            user_report={user_report}
                            SelectUserReports={this.SelectUserReports}
                            ChangeUserReports={this.ChangeUserReports} />
            );
            btn_user_reports.push(                
<li key={"user-report-li-"+user_report.id}><a href={"#user-report-"+user_report.id} 
        aria-controls={"user-report-"+user_report.id}
        id={"user-report-li-"+user_report.id} 
        role="tab" data-toggle="tab">{user_report.name}</a></li>
            );
        });

        return(
<div className="user-reports">
    <div className="user-report-form">
        <UserReportForm AddUserReport={this.AddUserReport} />
    </div>
    <div className="user-reports-selection">
        <div className="dropdown">
            <button id="dLabel" 
                    type="button" 
                    className="btn btn-default btn-block text-center"
                    data-toggle="dropdown" 
                    aria-haspopup="true" 
                    aria-expanded="false">
                I tuoi Prospetti
                <span className="caret"></span>
            </button>
            <ul className="dropdown-menu" aria-labelledby="dLabel">
            {btn_user_reports}
            </ul>
        </div>
    </div>
    <div className="tab-content">
        {user_reports}
    </div>
</div>
        );
    }
}

class UserReportForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            name: ''
        };
        this.Save = this.Save.bind(this);
        this.Put = this.Put.bind(this);
        this.Post = this.Post.bind(this);
        this.HandleChange = this.HandleChange.bind(this);
    }
    componentDidMount(){
        if(this.props.user_report){
            this.setState({name: this.props.user_report.name});
        }
    }
    Post(){
        $.ajax({
            url: '/api/user_reports',
            type: 'POST',
            data: {
                user_report : {
                    name: this.state.name
                }
            },
            success: (user_report) => {
                this.setState({name: ''});
                this.props.AddUserReport(user_report);
            },
            error: (xhr, error, status) => { console.log(xhr, error, status); }
        });
    }
    Put(){
        var user_report = this.props.user_report;
        user_report.name = this.state.name;
        $.ajax({
            url: '/api/user_reports/'+user_report.id,
            type: 'PUT',
            data: {
                user_report : user_report
            },
            success: (user_report) => {
                this.props.ChangeUserReports(this.props.user_report, user_report);
            },
            error: (xhr, error, status) => { console.log(xhr, error, status); }
        });
    }
    Save(){
        if(this.props.user_report){
            this.Put();
        } else {
            this.Post();
        }
    }
    HandleChange(e){
        var name = e.target.name;
        var value = e.target.value;
        this.setState({ [name] : value});
    }
    render(){
        return(
<form>
    <input className="form-control" type="text" name="name" value={this.state.name} onChange={this.HandleChange}/>
    <button className="btn btn-default" type="reset">Annulla</button> 
    <button className="btn btn-default" type="button" onClick={this.Save}>Salva</button>
</form>
        )
    }
}

class UserReport extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            edit_mode : false,
            movements : [],
            periodical_movements : [],
            totale : 0,
            accrediti : 0,
            addebiti : 0,
            date_from: '',
            date_to: ''
        }
        this.ChangeUserReports = this.ChangeUserReports.bind(this);
        this.Delete = this.Delete.bind(this);
        this.GetMovements = this.GetMovements.bind(this);
        this.GetPeriodicalMovements = this.GetPeriodicalMovements.bind(this);
        this.ToggleMode = this.ToggleMode.bind(this);
        this.Load = this.Load.bind(this);
        this.OpenPerMovForm = this.OpenPerMovForm.bind(this);
        this.OpenMovForm = this.OpenMovForm.bind(this);
        this.HandleChange = this.HandleChange.bind(this);
    }
    componentDidMount(){
        this.Load();
    }
    Load(){
        this.GetMovements();
        this.GetPeriodicalMovements();
    }
    GetMovements(){
        var user_report = this.props.user_report;
        
        $.ajax({
            url: '/api/user_reports/'+user_report.id+"/movements",
            type: 'GET',
            data: {
                date_from : this.state.date_from,
                date_to : this.state.date_to
            },
            success: (movements) => { 

                var tot_accrediti = 0;
                var tot_addebiti = 0;

                movements.forEach(m => {
                    if(m.movement_type == 1) {
                        tot_accrediti += Math.round(parseFloat(m.amount) * 100)/100;
                    }
                    if(m.movement_type == 2) {
                        tot_addebiti += Math.round(parseFloat(m.amount) * 100)/100;
                    }
                });

                var totale = tot_accrediti - tot_addebiti;
                totale = Math.round(parseFloat(totale) * 100)/100;

                this.setState({
                    movements : movements, 
                    totale : totale, 
                    accrediti : tot_accrediti,
                    addebiti : tot_addebiti
                 }); 
            },
            error: (xhr, error, status) => { this.setState(xhr, error, status); }
        });
    }
    GetPeriodicalMovements(){
        var user_report = this.props.user_report;
        $.ajax({
            url: '/api/user_reports/'+user_report.id+"/periodical_movements",
            type: 'GET',
            success: (periodical_movements) => { 
                this.setState({ periodical_movements : periodical_movements }); 
            },
            error: (xhr, error, status) => { this.setState(xhr, error, status); }
        });
    }
    ChangeUserReports(old_user_report, new_user_report){
        this.setState({edit_mode: false});
        this.props.ChangeUserReports(old_user_report, new_user_report);
    }
    Delete(e){
        e.preventDefault();
        $.ajax({
            url: '/api/user_reports/'+this.props.user_report.id,
            type: 'DELETE',
            success: () => { this.props.ChangeUserReports(this.props.user_report); },
            error: (xhr, error, status) => { console.log(xhr, error, status); }
        });
    }
    ToggleMode(e){
        e.preventDefault();
        var edit_mode = !this.state.edit_mode;
        this.setState({edit_mode:edit_mode});
    }
    OpenPerMovForm(){
        $("#periodicalMovementForm"+this.props.user_report.id).modal("show");
    }
    OpenMovForm(){
        $("#movementForm"+this.props.user_report.id).modal("show");
    }
    HandleChange(e){
        var name = e.target.name;
        var value = e.target.value;

        this.setState({[name] : value});
    }
    render(){
        var active = this.props.selected ? " active" : "";
        
        var movements = [];
        this.state.movements.forEach(movement => {
            movements.push(<Movement key={"movement-"+movement.id} 
                                     movement={movement} 
                                     user_report={this.props.user_report}
                                     Reload={this.Load} />);
        });
        
        var periodical_movements = [];
        this.state.periodical_movements.forEach(periodical_movement => {
            periodical_movements.push(<PeriodicalMovement key={"periodical-movement-"+periodical_movement.id} 
                                                          periodical_movement={periodical_movement}
                                                          user_report={this.props.user_report}
                                                          Reload={this.Load} />);
        });
        var periodical_movement_form = (
        <PeriodicalMovementForm user_report={this.props.user_report} 
                                current_user={this.props.current_user}
                                Reload={this.Load} />);

        var periodical_movement_modal = <ModalWindow modal_id={"periodicalMovementForm"+this.props.user_report.id }
                                                    title="Nuovo Movimento Periodico"
                                                    modal_body={periodical_movement_form} />;
        var settings_section = (
            <section>
                <h4>Impostazioni</h4>
                <button type="button" className="btn btn-primary" onClick={this.OpenPerMovForm}>
                    Nuovo Movimento Periodico
                </button>
                {periodical_movement_modal}
                {periodical_movements}
            </section>
            );

        var movement_form = <MovementForm   user_report={this.props.user_report} 
                                current_user={this.props.current_user}
                                Reload={this.Load} />

        var movement_modal = <ModalWindow modal_id={"movementForm"+this.props.user_report.id }
                                title="Nuovo Movimento"
                                modal_body={movement_form} />;

        var movements_section = (
            <section>
                <h4>Movimenti</h4>
                <button type="button" className="btn btn-primary" onClick={this.OpenMovForm}>
                    Nuovo Movimento
                </button>
                {movement_modal}
                {movements}
            </section>
            );
        var header = (
            <header>
                <h2>{this.props.user_report.name} </h2>
                <h2><a href="" onClick={this.Delete}><i className="fa fa-times"></i></a></h2>
                <h2><a href="" onClick={this.ToggleMode}><i className="fa fa-pencil"></i></a></h2>
            </header>
            );
        if(this.state.edit_mode){
          header =(
                <header>
                    <UserReportForm user_report={this.props.user_report} ChangeUserReports={this.ChangeUserReports} />
                    <h2><a href="" onClick={this.ToggleMode}><i className="fa fa-pencil"></i></a></h2>
                </header>);
            } 
        return(
<div role="tabpanel" className="user-report tab-pane" id={"user-report-"+this.props.user_report.id}>
        {header}
        <section>
            <ul className="list-group">
                <li className="list-group-item">Accrediti: {this.state.accrediti}</li>
                <li className="list-group-item">Addebiti: {this.state.addebiti}</li>
                <li className="list-group-item">Totale: {this.state.totale}</li>
            </ul>
        </section>

  <ul className="nav nav-tabs" role="tablist">
    <li role="presentation" className="active"><a href="#home" aria-controls="home" role="tab" data-toggle="tab">Home</a></li>
    <li role="presentation"><a href="#settings" aria-controls="settings" role="tab" data-toggle="tab">Impostazioni</a></li>
  </ul>

  <div className="tab-content">
    <div role="tabpanel" className="tab-pane active" id="home">
        <div className="form-inline">
            <div className="form-group half half-left">
                <label htmlFor="date_from">Da: </label>
                <input className="form-control" type="date" name="date_from" value={this.state.date_from} onChange={this.HandleChange} />
            </div>
            <div className="form-group half half-right">
                <label htmlFor="date_to">A: </label>
                <input className="form-control" type="date" name="date_to" value={this.state.date_To} onChange={this.HandleChange} />
            </div>
            <button className="btn btn-default" type="button" onClick={this.GetMovements}>
                <i className="fa fa-search"></i> Filtra
            </button>
        </div>
        {movements_section}
    </div>
    <div role="tabpanel" className="tab-pane" id="settings">
        {settings_section}
    </div>
  </div>

</div>
            );
        }
}