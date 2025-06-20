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
 * Renders the table rows based on the provided data array.
 * @param {Array} data - Array of data objects to display in the table.
 */
function renderTable(data) {
  // Select the table body element where rows will be inserted
  const tableBody = document.querySelector('#dataTable tbody');
  // Clear any existing content in the table body to avoid duplication
  tableBody.innerHTML = '';

  // Iterate over each item in the data array
  data.forEach(item => {
    // Create a new table row element
    const row = document.createElement('tr');
    
    //set up each row using the right json values
    //clicking on the row opens a new window with the TRR.
    row.onclick = function() { window.open(BaseURL + "reports/" + item['id'].toLowerCase() + "/" + item['platforms'][0])};
    //create the Primary ID cell
    const IDCell = document.createElement('td');
    IDCell.textContent = item['id'];
    row.appendChild(IDCell);
    //create the Secondary ID cell
    const ExtIDCell = document.createElement('td');
    ExtIDCell.textContent = item['external_ids'].join(", ");
    row.appendChild(ExtIDCell);
    //create the Name cell
    const NameCell = document.createElement('td');
    NameCell.textContent = item['name'];
    row.appendChild(NameCell);
    //create the Platform cell
    const PlatformCell = document.createElement('td');
    //lookup full platform name from abbreviation
    const fullPlatforms = new Array();
    for (const key in item['platforms']) {
      fullPlatforms.push(PlatformKey[item['platforms'][key]]);
    }
    PlatformCell.textContent = fullPlatforms.join(", ");
    row.appendChild(PlatformCell);
    //create the Procedures cell
    const ProceduresCell = document.createElement('td');
    ProceduresCell.className = "left";
    var strProcedures = "";
    for (const key in item['procedures']) {
      strProcedures = strProcedures + key + ": " + item['procedures'][key] + "\n";
    }
    ProceduresCell.textContent = strProcedures;
    row.appendChild(ProceduresCell);
    // Append the completed row to the table body
    tableBody.appendChild(row);
  });
}

// Initial render of the table using the full data array
renderTable(data);

/**
 * Handles the search functionality by filtering the data array
 * based on the user's input and re-rendering the table. Uses case
 * insensitive regex to find the search terms in any case and order.
 */
function handleSearch() {
  const query = searchInput.value;   
  const words = query.split(' ');
  var exp = '';
  //build postive lookahead regex for each word in the query
  words.forEach(word => {
    exp += '(?=.*' + word + ')';
  });
  
  const regex = new RegExp(exp, 'i');
  const results = data.filter(obj => {
    //regex test the whole object (stringified) so we can match across all values
    return regex.test(JSON.stringify(obj));
  });
   renderTable(results);;
};

// Reference to the search input field in the DOM
const searchInput = document.getElementById('searchInput');
// Add an event listener to handle input changes in the search field
searchInput.addEventListener('keyup', handleSearch);

/**
 * Handles the sorting functionality by sorting the data array
 * based on the selected column and re-rendering the table.
 * @param {Event} event - The click event triggered by clicking a table header.
 */
function handleSort(event) {
  // Reference to the clicked header element
  const header = event.target;
  // Get the column to sort by from the data attribute
  const column = header.getAttribute('data-column');
  // Get the current sort order (asc or desc) from the class attribute
  const order = header.getAttribute('class');

  // Determine the new sort order by toggling the current order
  const newOrder = order === 'desc' ? 'asc' : 'desc';
  // Update the data-order attribute with the new sort order
  //header.setAttribute('data-order', newOrder);
  header.setAttribute('class', newOrder);

  // Create a sorted copy of the data array to avoid mutating the original
  const sortedData = [...data].sort((a, b) => {
    // Compare the two items based on the selected column
    if (a[column] > b[column]) {
      // Return 1 or -1 based on the sort order
      return newOrder === 'asc' ? 1 : -1;
    } else if (a[column] < b[column]) {
      return newOrder === 'asc' ? -1 : 1;
    } else {
      // Return 0 if the values are equal
      return 0;
    }
  });

  // Re-render the table using the sorted data array
  renderTable(sortedData);
}

// Select all table header cells that are sortable
const headers = document.querySelectorAll('th');
// Add a click event listener to each sortable header cell to enable sorting
headers.forEach(header => {
  if (header.className != "nosort") {header.addEventListener('click', handleSort)}
});
document.getElementById ("hideIntroX").addEventListener ("click", hideIntro);
document.getElementById ("showIntro").addEventListener ("click", showIntro);
document.getElementById("TRRGuideRef").href=BaseURL+"docs/TECHNIQUE-RESEARCH-REPORT.md";
document.getElementById("ProjOverviewRef").href=BaseURL+"docs/PROJECT-OVERVIEW.md";
document.getElementById("FAQRef").href=BaseURL+"docs/FAQ.md";
