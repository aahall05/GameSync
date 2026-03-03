import { useState } from 'react';
import '../Stylesheets/Homepage.css';
import Layout from './Layout';
import Card from '../Components/Card';
import { useNavigate } from 'react-router-dom';
import { SessionCard } from '../Components/Card';
function UserHomepage() {
    const navigate = useNavigate();
    return (
        <Layout>
            <>
                <Card className="title-card">
                    {/*TODO : replace [User] with actual username from auth context*/}
                    <h1>Welcome Back [User]</h1>
                </Card>

                <div className="homepage-row">
                    <Card className="create-session">
                        <h2> Recent Sessions</h2>
                        {/*TODO : replace with actual session data from backend 
                        (probably jsut the three latest?), for now just hardcoded*/}
                        <SessionCard
                            title="Boone High vs Edgewater - March 15, 2026"
                            onView={() => navigate('/session/123')}
                            onShare={() => console.log('share')}
                        />
                    </Card>
                    <Card className="create-session">
                        <div className="homepage-column">
                            <button onClick={() => navigate('/create-session')}>
                                Create Session
                            </button>

                            <button onClick={() => navigate('/join-session')}>
                                Join Session
                            </button>
                        </div>
                    </Card>
                </div>

                <button onClick={() => navigate('/user-information')}>
                    User Information
                </button>

            </>
        </Layout>
    );
}

export default UserHomepage;