//Set the base URL of the backend repo. This is used to build the link to each TRR.
const BaseURL="https://github.edwardjones.com/ejsecure/technique-research-reports/tree/main/";

// retrieve the data from a local index.json file
import data from "./index.json" with { type: 'json' };

// retrieve the platform data from a local platform.json file
import PlatformKey from "./platforms.json" with { type: 'json' };

/**
//retrieve index data from repo's index.json file
import data from "https://github.edwardjones.com/raw/ejsecure/technique-research-reports/main/index.json" with { type: 'json' };
**/

/**
// retrieve the platform data from repo's platforms.json file
import PlatformKey from "https://github.edwardjones.com/raw/ejsecure/technique-research-reports/main/platforms.json" with { type: 'json' };
**/

const OrderedTactics = [
  "Initial Access",
  "Execution",
  "Persistence",
  "Privilege Escalation",
  "Defense Evasion",
  "Credential Access",
  "Discovery",
  "Lateral Movement",
  "Collection",
  "Command and Control",
  "Inhibit Response Function",
  "Inhibit Process Control",
  "Exfiltration",
  "Impact",
]

//populate the data with a full_platforms field to support text search against platform names
data.forEach(item => {
  var full_platforms = new Array();
  const short_platforms = item['platforms'];
  short_platforms.forEach(platform => {
    //look up the full name for each short name 
    full_platforms.push(PlatformKey[platform]);
  });
  //add a new element to the JSON holding an array of full platform names.
  item['full_platforms']=full_platforms;
});

function hideIntro() {
  var x = document.getElementById("intro-container");
  var y = document.getElementById("showIntro");
  x.style.display="none";
  y.style.display="block";
}

function showIntro() {
  var x = document.getElementById("intro-container");
  var y = document.getElementById("showIntro");
  x.style.display="block";
  y.style.display="none";
}

/**
*Renders the matrix based on provided data array.
* @param {Array} data - Array of objects to display in the matrix
**/
function renderMatrix(matrixData) {
  //First we'll process the data and create our matrix in a multidimensional array.
  //matrix is our array of arrays. We'll index it by tactic using OrderedTactics to find the right element.
  const matrix = new Array(OrderedTactics.length);
  //make an array to hold the TRRs for each tactic
  for (var i = 0; i < matrix.length; i++) {
  matrix[i] = new Array();
  }
    
  matrixData.forEach(trr => {
    const trrtactics = trr['tactics']; 
    trrtactics.forEach(tactic => {
      //add the trr object to the array corresponding to the tactic
      matrix[OrderedTactics.indexOf(tactic)].push(trr);
    })
  });
  
  const table = document.querySelector('#matrixTable');
  // delete the existing row.
  table.deleteRow(0);
  
  //add a new single row to the matrix table
  const matrixRow = table.insertRow();
  //then add a new td and tacticTable for each tactic
  for (var i = 0; i < matrix.length; i++) {
    const tacticArray = matrix[i];
    if (tacticArray.length > 0) { //there are TRRs for the tactic
      //this a cell in the matrixTable's single row that holds the tactic's table
      const holdingCell = matrixRow.insertCell();    
      //create a new table of class tacticTable
      const tacticTable = document.createElement('table');
      tacticTable.className = "tacticTable";
      const th = document.createElement('th');
      tacticTable.append(th);
      th.innerHTML = OrderedTactics[i];
      
      //create a new tr and td for each item
      tacticArray.forEach(trrEntry => {
        const tacticRow = tacticTable.insertRow();
        const tacticCell = tacticRow.insertCell();
        tacticCell.innerHTML = trrEntry['name'];
        //make span for tooltip hover
        var hoverSpan = tacticCell.appendChild(document.createElement("span"));
        hoverSpan.className = "tooltiptext";
        hoverSpan.innerHTML= trrEntry['id'] + "<p>" + trrEntry['external_ids'].join(", ") + "</p>";
        
        var link = ""
        //link depends on if it's technique or platform-level
        if (platformSelect.value == "all") {
        //if (trrEntry['id'].split('.').length > 1){
          //platform-level
          link = (trrEntry['id'].toLowerCase());
        } else {
          //technique-level - link is ID + short platform name (of the first platform, if multiple)
          link = trrEntry['id'].toLowerCase() + "/" + trrEntry['platforms'][0];
        }
        tacticCell.onclick = function() { window.open(BaseURL + "reports/" + link) };
      });
      holdingCell.appendChild(tacticTable);
    }
  }
  //add the row to the table
  table.appendChild(matrixRow);     
}

/**
*Filters data for the platform specified. Returns json object with filtered data.
* @param {String} filterValue - value of the platform to filter for
**/
function filterData(filterValue){
  if (filterValue == "all"){ 
    //render the data for a merged all platforms view
    var filteredData = [];
    const seen = new Set(); //list of TRR IDs already seen
    data.forEach(trr => {
      const techID = trr['id'].split(".")[0]; //just the ID, no platform value
      if (seen.has(techID)){
        //merge current trr data with the one already added
        const entry = filteredData.find(item=>item.id==techID);
        var mergedTactics = entry['tactics'].concat(trr['tactics']);
        entry['tactics'] = [...new Set(mergedTactics)];
        var mergedPlatforms = entry['platforms'].concat(trr['platforms']);
        entry['platforms'] = [...new Set(mergedPlatforms)];
        var mergedExtIDs = entry['external_ids'].concat(trr['external_ids']);
        entry['external_ids'] = [...new Set(mergedExtIDs)];
      } else {
        //keep only certain attributes for aggregated view
        const shortEntry = {};
        shortEntry['id'] = techID;
        shortEntry['tactics'] = trr['tactics'];
        shortEntry['platforms'] = trr['platforms'];
        shortEntry['name'] = trr['name'];
        shortEntry['external_ids'] = trr['external_ids'];
        
        filteredData.push(shortEntry);
        seen.add(techID); //add it to the list of seen TRRs
      }
  });
    return filteredData; 
  }
  //otherwise, make a filtered set that holds just the platform specified
  var filteredData = [];
  data.forEach(trr => {
    if (Object.values(trr['platforms']).includes(filterValue)){
      filteredData.push(trr);
    }
  });
  
  return filteredData;
}

//Perform everything needed for inital setup of the page

//populate the dropdown options
const platformSelect = document.getElementById('platformSelect')
platformSelect.innerHTML = ''; // Clear existing options

//set up default option of 'all platforms'
const alloption = document.createElement('option');
alloption.value = "all";
alloption.text = "All Platforms";
platformSelect.appendChild(alloption);

for (let key in PlatformKey) {
  const option = document.createElement('option');
  option.value = key;
  option.text = PlatformKey[key];
  platformSelect.appendChild(option);
}

//set up a listner to update the matrix when a new platform is selected
platformSelect.addEventListener("change", function() {
  const selectedValue = this.value;
  const filtered = filterData(selectedValue);
  renderMatrix(filtered);
});

//first render the matrix using all platform view
renderMatrix(filterData("all"));

document.getElementById ("hideIntroX").addEventListener ("click", hideIntro);
document.getElementById ("showIntro").addEventListener ("click", showIntro);
document.getElementById("TRRGuideRef").href=BaseURL+"docs/TECHNIQUE-RESEARCH-REPORT.md";
document.getElementById("ProjOverviewRef").href=BaseURL+"docs/PROJECT-OVERVIEW.md";
document.getElementById("FAQRef").href=BaseURL+"docs/FAQ.md";
