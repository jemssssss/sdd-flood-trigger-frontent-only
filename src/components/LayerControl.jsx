import "../styles/App.css";

function LayerControl({

	showSynoptic,
	setShowSynoptic,

	showAWS,
	setShowAWS,

	showFootprints,
	setShowFootprints

}) {

	return (

		<div className="layer-control">

				<h3>Layers</h3>

				<label>

					<input
						type="checkbox"
						checked={showSynoptic}
						onChange={(e)=>
							setShowSynoptic(e.target.checked)
						}
					/>

					Synoptic Stations

				</label>

				<label>

					<input
						type="checkbox"
						checked={showAWS}
						onChange={(e)=>
							setShowAWS(e.target.checked)
						}
					/>

					AWS Stations

				</label>

				<label>

					<input
						type="checkbox"
						checked={showFootprints}
						onChange={(e)=>
							setShowFootprints(e.target.checked)
						}
					/>

					Sentinel-1 Footprints

				</label>

		</div>

	);

}

export default LayerControl;