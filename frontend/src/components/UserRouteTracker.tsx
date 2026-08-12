import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import graphiteService from '../services/graphiteService';

const UserRouteTracker: React.FC = () => {
    const location = useLocation();
    
    useEffect(() => {
        // This component is only rendered inside /user routes,
        // so every path change here is a user page view
        graphiteService.incrementPageView();
    }, [location.pathname]);
    
    return null;
};

export default UserRouteTracker;