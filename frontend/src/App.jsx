import { Outlet, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import NavigationBar from './NavigationBar';
import './index.css';

function App(){
    const navigate = useNavigate();
    const navigateToHome = () => {
        navigate('/');
    };

    return (
        <>
        <NavigationBar onNavigateHome={navigateToHome} />

        <Container fluid="xl" className="my-5">
            <Outlet />
        </Container>
        </>
    )
}

export default App;