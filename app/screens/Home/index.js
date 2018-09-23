import React, {Component} from 'react';
import request from "superagent";

export default class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: false,
            hasMore: true,
            isLoading: false,
            users: [],

        };
    }

    componentWillMount() {
        // Loads some users on initial load
        this.loadUsers();
    }
    componentDidMount(){
        window.addEventListener('scroll', () => {
            const {
                loadUsers,
                state: {
                    error,
                    isLoading,
                    hasMore,
                },
            } = this;

            // Bails early if:
            // * there's an error
            // * it's already loading
            // * there's nothing left to load
            if (error || isLoading || !hasMore) return;
            // Checks that the page has scrolled to the bottom
            if (
                window.innerHeight + document.documentElement.scrollTop
                === document.documentElement.offsetHeight
            ) {
                loadUsers();
            }
        })
    }
    loadUsers = () => {
        this.setState({ isLoading: true }, () => {
            request
                .get('https://randomuser.me/api/?results=5')
                .then((results) => {
                    // Creates a massaged array of user data
                    const nextUsers = results.body.results.map(user => ({
                        email: user.email,
                        name: Object.values(user.name).join(' '),
                        photo: user.picture.thumbnail,
                        username: user.login.username,
                        uuid: user.login.uuid,
                        registeredDate : user.registered.date
                    }));

                    // Merges the next users into our existing users
                    this.setState({
                        // Note: Depending on the API you're using, this value may
                        // be returned as part of the payload to indicate that there
                        // is no additional data to be loaded
                        hasMore: (this.state.users.length < 21),
                        isLoading: false,
                        users: [
                            ...this.state.users,
                            ...nextUsers,
                        ],
                    });
                })
                .catch((err) => {
                    this.setState({
                        error: err.message,
                        isLoading: false,
                    });
                })
        });
    };

    render() {
        const {
            error,
            hasMore,
            isLoading,
            users,
        } = this.state;
        return (
            <div>
                { users.map((user) =>
                    {
                        console.log(user);
                        return(
                            <div key={user.email} className={'thumbnail'}>
                                <div className={'thumnbail__image'}>
                                    <img src={user.photo} alt={user.email} />
                                </div>
                                <div className={'thumbanil__profile'}>
                                    <div className={'thumnbail__person'}>{user.name}</div>
                                    <div className={'thumbnal__registered-date'}>{user.registeredDate}</div>
                                </div>
                            </div>
                        )
                    })
                }

                <hr />
                {error &&
                <div style={{ color: '#900' }}>
                    {error}
                </div>
                }
                {isLoading &&
                <div>Loading...</div>
                }
                {!hasMore &&
                <div>You did it! You reached the end!</div>
                }
            </div>
        );
    }
}

Home.contextTypes = {
    router: React.PropTypes.object.isRequired,
}
