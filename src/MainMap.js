import React, {Component} from 'react';
import {Container, Row, Col} from 'reactstrap';
import PlacesAutocomplete, {geocodeByPlaceId, getLatLng} from 'react-places-autocomplete';
import dropPin from './assets/drop_pin.png';
import Util from './util';
import Intro from './components/Intro';
import PropertyDetails from './components/PropertyDetails';
import './css/autocomplete.css';

/*global google */
/*eslint no-undef: "error"*/

class MainMap extends Component {
    constructor(props) {
        super(props)
        this.state = {
            address: "",
            placeId: "",
            crimeData: {
                "disorderly": 3,
                "noise": 12,
                "substance": 0,
                "domestic": 0,
                "misdemeanor": 2,
                "hazard": 2,
                "misc": 0
            },
            travelTime: {
                "drive_dist": "2.1 mi",
                "drive_time": "9 mins",
                "bike_dist": "1.8 mi",
                "bike_time": "12 mins",
                "walking_dist": "2.2 mi",
                "walking_time": "23 mins"
            }
        }
    }

    componentDidMount() {
        // Create Google MainMap
        let map = new google.maps.Map(this.refs.map, {
            center: {lat: 35.298211, lng: -120.659377},
            zoom: 12
        });
        let marker = new google.maps.Marker({
            map: map,
            visible: false,
            icon: dropPin,
            position: {lat: 35.298211, lng: -120.659377},
        });
        this.setState({map: map, mapMarker: marker})
    }

    componentWillReceiveProps(nextProps) {
        console.log("changed")
        if (this.props.location !== nextProps.location){
            const location = nextProps.location;
            this.getBackendData({lat: location.lat, lng: location.lng})
            this.getTimes({lat: location.lat, lng: location.lng})
            this.state.mapMarker.setPosition({lat: location.lat, lng: location.lng})
            this.state.map.setCenter({lat: location.lat, lng: location.lng})
            this.state.map.setZoom(15)
            this.state.mapMarker.setVisible(true)
        }
    }

    getTimes = (location) => {
        Util.fetchWrapper("rental/" + location.lat + "/" + location.lng,
            {method: 'GET'})
        .then((responseJSON) => {
            this.setState({travelTime: responseJSON})
        })
        .catch((errorJSON) => {
            this.setState({error: errorJSON})
        })
    }

    getBackendData = (location) => {
        Util.fetchWrapper("rental/reports/" + location.lat + "/" + location.lng + "/482",
            {method: 'GET'})
        .then((responseJSON) => {
            this.setState({crimeData: responseJSON})
        })
        .catch((errorJSON) => {
            this.setState({error: errorJSON})
        })
    }

    render() {
        const renderFooter = () => (
            <div className="dropdown-footer">
                <div>
                    <img className="m-1" src={require('./assets/powered_by_google_on_white_hdpi.png')} width="112px"
                         alt="Powered By Google"/>
                </div>
            </div>
        )
        const options = {
            location: new google.maps.LatLng(35.298, -120.659),
            radius: 25,
            types: ['address']
        }
        return (
            <Container fluid>
                <Row>
                    <Col lg="5" md="6">
                        {(this.props.address !== "") ? <PropertyDetails property={
                            {
                                address: this.props.address,
                                campusDistance: this.state.travelTime.drive_dist,
                                carTime: this.state.travelTime.drive_time,
                                bikeTime: this.state.travelTime.bike_time,
                                walkTime: this.state.travelTime.walking_time
                            }
                        } crimeData={this.state.crimeData} /> : <Intro />}
                    </Col>
                    <Col lg="7" md="6" className="p-0">
                        <div style={{minHeight: "calc(100vh - 116px)", width: "100%"}} ref="map"/>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default MainMap;


