//window.addEventListener('load', initialize);
document.addEventListener('DOMContentLoaded', () => {
  initialize();
});

// calls the necessary functions to set up the initial view and load projects from a given date span.
async function initialize() {
  setupInitialView();
  const startDate = new Date();
  const endDate = addDays(startDate, 27);
  const resources = await fetchResources();
  const currentDate = addDays(new Date(), -7);
  const projects = await fetchProjects(currentDate, endDate);
  displayResources(resources);
  displayProjects(projects, currentDate, endDate);
}

// creates the initial view for the timeline, including days and months.
function setupInitialView() {
  const currentDate = addDays(new Date(), -7);
  const daysContainer = document.querySelector('.days');
  const monthsContainer = document.querySelector('.months');

  for (let i = 0; i < 28; i++) {
    const dayElement = createDayElement(currentDate);
    daysContainer.appendChild(dayElement);

    if (isFirstDayOfMonth(currentDate) || i === 0) {
      const monthElement = createMonthElement(currentDate, i);
      monthsContainer.appendChild(monthElement);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }
}

// recalculates the width of each month element based on the visible days in each month.
function updateMonthElementWidths() {
  const monthElements = document.querySelectorAll('.month');
  const dayElementWidth = document.querySelector('.day').offsetWidth;
  let lastMonthWidth = 0;
  monthElements.forEach((monthElement) => {
    const monthNumber = monthElement.getAttribute('data-month');
    const monthDays = document.querySelectorAll('.day[data-month="' + monthNumber + '"]');
    const totalDaysInMonth = monthDays.length;
    const monthWidth = totalDaysInMonth * dayElementWidth;
    monthElement.style.width = `${monthWidth}px`;
    monthElement.style.left = `${lastMonthWidth}px`;
    lastMonthWidth += monthWidth;
  });
}

// adds 14 days to the right of the timeline, including month names and days.
async function loadDaysToTheRight() {
  const currentDate = addDays(new Date(), -7);
  const lastDayElement = document.querySelector('.day:last-child');
  const startDate = addDays(new Date(lastDayElement.dataset.date), 1);
  const endDate = addDays(startDate, 13);
  addDaysToTimeline(startDate, endDate);
  updateMonthElementWidths(); // update the month element widths
  const projects = await fetchProjects(currentDate, endDate);
  displayProjects(projects, currentDate, endDate);
}

// adds 14 days to the left of the timeline, including month names and days.
function loadDaysToTheLeft() {
  console.log('load 14 days to the left');
  /*
  const firstDayElement = document.querySelector('.day:first-child');
  const endDate = addDays(new Date(firstDayElement.dataset.date), -1);
  const startDate = addDays(endDate, -13);
  addDaysToTimeline(startDate, endDate);
  updateMonthElementWidths(); // update the month element widths
  */
}

// listens for scrolling events on the timeline and triggers the appropriate action based on the scroll position.
document.querySelector('#timeline').addEventListener('scroll', handleTimelineScroll);

function handleTimelineScroll() {
  const timeline = document.querySelector('#timeline');
  if (timeline.scrollLeft === 0) {
    loadDaysToTheLeft();
  } else if (timeline.scrollWidth - timeline.clientWidth - timeline.scrollLeft < 1) {
    loadDaysToTheRight();
  }
}

// listens for dropping events
function handleDrop(event) {
  event.preventDefault();
  const projectId = event.target.dataset.id;
  const resourceId = event.dataTransfer.getData('text/plain');
  console.log(projectId, resourceId);
  const assignedResources = event.target.dataset.resources ? event.target.dataset.resources.split(',') : [];
  if (!assignedResources.includes(resourceId)) {
    console.log(resourceId); // log the resource id to the console
  /*   
    assignedResources.push(resourceId);
    event.target.setAttribute('data-resources', assignedResources.join());
    const assignedResourcesList = event.target.querySelector('.assigned-resources');
    const resourceCard = document.querySelector(`[data-id="${resourceId}"]`);
    const assignedResourceItem = createAssignedResourceItem(resourceCard);
    assignedResourcesList.appendChild(assignedResourceItem);
  */
  } else {
    console.log('resource already present'); // log a message to the console if the resource is already assigned
  }
}

// checks if a given date is the first day of its respective month.
function isFirstDayOfMonth(date) {
  return date.getDate() === 1;
}

// creates a day element with a given date.
function createDayElement(date) {
  const dayElement = document.createElement('div');
  dayElement.classList.add('day');
  dayElement.setAttribute('data-month', date.getMonth() + 1);
  dayElement.setAttribute('data-date', date.toISOString());
  dayElement.textContent = date.getDate();
  return dayElement;
}

// creates a month element with a given date and index, and calculates its width based on the visible days in the month.
function createMonthElement(date, index) {
  const monthElement = document.createElement('div');
  monthElement.classList.add('month');
  monthElement.textContent = date.toLocaleString('default', { month: 'long' });
  monthElement.setAttribute('data-month', date.getMonth() + 1);

  let prevMonthWidth = 0;
  const prevMonth = document.querySelectorAll('.month[data-month="' + date.getMonth() + '"]');
  if(prevMonth.length){
    prevMonthWidth = prevMonth[0].offsetWidth;
  }

  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() - date.getDate() + 1;
  const visibleDaysInMonth = daysInMonth > 28 - index ? 28 - index : daysInMonth;
  const dayElementWidth = document.querySelector('.day').offsetWidth;
  const monthWidth = visibleDaysInMonth * dayElementWidth;

  monthElement.style.width = `${monthWidth}px`;
  monthElement.style.left = `${prevMonthWidth}px`;
  return monthElement;
}

// adds a given number of days to a given date.
function addDays(date, days) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

// adds a range of days to the timeline, including month names and days.
function addDaysToTimeline(startDate, endDate) {
  const daysContainer = document.querySelector('.days');
  const monthsContainer = document.querySelector('.months');
  let currentDate = startDate;

  while (currentDate <= endDate) {
    const dayElement = createDayElement(currentDate);
    daysContainer.appendChild(dayElement);

    if (isFirstDayOfMonth(currentDate)) {
      const monthElement = createMonthElement(currentDate, daysContainer.childElementCount - 1);
      monthsContainer.appendChild(monthElement);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }
}

async function fetchResources() {
  // Fetch resources data from the WordPress REST API
  //const response = await fetch('https://example.com/wp-json/your-plugin/v1/resources');
  const response = await fetch('resources.json');
  const data = await response.json();
  return data.resources;
}

function displayResources(resources) {
  // Generate resource cards
  const resourceContainer = document.querySelector('.resources');
  resources.forEach(resource => {
    const resourceCard = document.createElement('div');
    resourceCard.classList.add('card', 'resource-card');
    resourceCard.draggable = true;
    resourceCard.dataset.resourceName = resource.name;
    resourceCard.dataset.resourceType = resource.type;
    resourceCard.dataset.resourceId = resource.id;
    resourceCard.innerHTML = `
      <div class="card-body">
        <div class="resource-name">${resource.name}</div>
        <div class="resource-category">${resource.type}</div>
      </div>
    `;
    resourceContainer.appendChild(resourceCard);
  });

  // Add dragstart event listener to parent element
  resourceContainer.addEventListener('dragstart', event => {
    // Find the closest .resource element to the target
    const resource = event.target.closest('.resource');
    if (resource) {
      const resourceType = resource.dataset.resourceType;
      const resourceId = resource.dataset.resourceId;
      event.dataTransfer.setData('text/plain', `${resourceType}:${resourceId}`);
    
      // Create a 'ghost' element that will follow the mouse
      const ghostElement = resource.cloneNode(true);
      ghostElement.classList.add('ghost');
      document.body.appendChild(ghostElement);
    
      // Set the initial position of the 'ghost' element to be on top of the resource being dragged
      const resourceRect = resource.getBoundingClientRect();
      ghostElement.style.left = `${resourceRect.left}px`;
      ghostElement.style.top = `${resourceRect.top}px`;
    
      // Set the dataTransfer property to the resource being dragged, so it can be accessed in the drop event
      event.dataTransfer.setDragImage(ghostElement, 0, 0);
    
      // Add a class to the resource being dragged to show it's being dragged
      resource.classList.add('dragging');
    }

    // Add dragend event listener to parent element
    resourceContainer.addEventListener('dragend', event => {
      // Find the closest .resource element to the target
      const resource = event.target.closest('.resource');
      if (resource) {
        // Remove the 'ghost' element from the DOM
        const ghostElement = document.querySelector('.ghost');
        if (ghostElement) {
          ghostElement.parentNode.removeChild(ghostElement);
        }
    
        // Remove the class that shows the resource being dragged
        resource.classList.remove('dragging');
      }
    });
  });
}

async function fetchProjects(startDate, endDate) {
  //const response = await fetch('https://example.com/wp-json/your-plugin/v1/projects');
  const response = await fetch('projects.json');
  const data = await response.json();

  const projects = data.projects.filter(project => {
    const projectStartDate = new Date(project.start_date);
    const projectEndDate = new Date(project.end_date);
    return (projectStartDate >= startDate && projectStartDate <= endDate) ||
      (projectEndDate >= startDate && projectEndDate <= endDate) ||
      (projectStartDate <= startDate && projectEndDate >= endDate);
  });

  return projects;
}

function displayProjects(projects, startDate, endDate) {
  const projectElements = [];
  const placedProjects = new Set();

  projects.forEach(project => {
    const projectStartDate = new Date(project.start_date);
    const projectEndDate = new Date(project.end_date);
    const projectDateSpan = Math.round((projectEndDate - projectStartDate) / (1000 * 60 * 60 * 24));
    const daysSinceStart = Math.round((projectStartDate - startDate) / (1000 * 60 * 60 * 24));
    const dayElementWidth = document.querySelector('.day').offsetWidth;
    const left = dayElementWidth * daysSinceStart;
    const width = dayElementWidth * projectDateSpan;

    const projectElement = document.createElement('div');
    projectElement.classList.add('project');
    projectElement.style.backgroundColor = project.color;

    /*
    projectElement.style.left = `calc((100% / ${dayElementWidth}) * ${daysSinceStart})`;
    projectElement.style.width = `calc((100% / ${dayElementWidth}) * ${projectDateSpan} - 1px)`;
    */

    projectElement.style.left = left + 'px';
    projectElement.style.width = width + 'px';

    const projectNameElement = document.createElement('div');
    projectNameElement.classList.add('project-name');
    projectNameElement.textContent = project.name; 
    projectElement.appendChild(projectNameElement);

    // Create resource dropzone element
    const resourceDropzoneElement = document.createElement('div');
    resourceDropzoneElement.classList.add('resource-dropzone');
    resourceDropzoneElement.setAttribute('data-project-id', project.id);
    
    // Add assigned resources
    project.resources.forEach((resourceId) => {
      const assignedResourceElement = document.createElement('li');
      const resourceElem = document.querySelector('.resource-card[data-resource-id="' + resourceId + '"]');
      assignedResourceElement.classList.add('assigned-resource');
      assignedResourceElement.dataset.resourceId = resourceId;
      assignedResourceElement.textContent = resourceElem.dataset.resourceName;
      resourceDropzoneElement.appendChild(assignedResourceElement);
    });
    projectElement.appendChild(resourceDropzoneElement);

    projectElement.addEventListener('dragover', function(event) {
      event.preventDefault(); // Prevent default action
      // Add hover class to the element
      projectElement.classList.add('hover');
    });

    projectElement.addEventListener('dragleave', function(event) {
      // Remove hover class from the element
      projectElement.classList.remove('hover');
    });

    projectElement.addEventListener('drop', handleDrop);

    // Check for overlaps with previously placed projects and adjust top
    let top = 0;
    for (const placedProject of placedProjects) {
      if (projectEndDate > placedProject.startDate && projectStartDate < placedProject.endDate) {
        top = Math.max(top, placedProject.top + 40);
      }
    }
    projectElement.style.top = `${top}px`;
    placedProjects.add({ startDate: projectStartDate, endDate: projectEndDate, top });
    projectElements.push(projectElement);
  });

  const timelineProjectsElement = document.querySelector('.projects');
  timelineProjectsElement.innerHTML = '';
  projectElements.forEach(projectElement => {
    timelineProjectsElement.appendChild(projectElement);
  });

  // callback function to ajust timeline height after updating the projects
  setTimelineContainerHeight();
}

function setTimelineContainerHeight() {
  const container = document.getElementById('timeline');
  const scrollContainer = container.querySelector('.projects');
  let maxHeight = 0;

  // Loop through the projects in the scroll container
  for (const project of scrollContainer.children) {
    const projectHeight = project.offsetHeight + project.offsetTop;
    if (projectHeight > maxHeight) {
      maxHeight = projectHeight;
    }
  }
  maxHeight += 170;
  // Set the height of the timeline container
  container.style.height = `${maxHeight}px`;
  scrollContainer.style.height = `${maxHeight}px`;
}