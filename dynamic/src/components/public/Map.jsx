import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 9.6127623,   // replace with your church latitude
  lng: 41.8376021,  // replace with your longitude
};

export default function Map() {
  return (
    <LoadScript googleMapsApiKey="AIzaSyCaYeJ2OwsChv1LBGeRn-pGiTy62A5ZPLE">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={17}>
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
}