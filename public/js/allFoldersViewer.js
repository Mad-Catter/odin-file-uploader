const modal = document.querySelector('#share-modal');
const linkDiv = document.querySelector('#link-div');
const creatingText = document.querySelector('#creating');
const shareError = document.querySelector('#share-error');
const shareForm = document.querySelector('#share-form');
const shareLink = document.querySelector('#share-link');

function toggleFiles(e) {
	const folderDiv = e.target.parentElement;
	const filesDiv = folderDiv.querySelector('.files');
	filesDiv.classList.toggle('hidden');
}
function toggleEdit(e) {
	const folderDiv = e.target.parentElement;
	const toggleButton = folderDiv.querySelector('.folder-toggle-button');
	const editSection = folderDiv.querySelector('.edit-section');

	toggleButton.classList.toggle('hidden');
	editSection.classList.toggle('hidden');
}
function openDeleteDialog(e) {
	const editDiv = e.target.parentElement;
	const dialog = editDiv.querySelector('dialog');
	dialog.show();
}
function closeDeleteDialog(e) {
	const dialog = e.target.parentElement;
	dialog.close();
}
async function deleteFolder(id) {
	try {
		fetch(`/folder/delete-folder/${id}`, {
			method: 'DELETE',
		}).then((response) => {
			window.location.reload();
		});
	} catch {
		window.location.href = '/404';
	}
}

function openShareModal(id) {
	const shareId = document.querySelector('#share-id');
	shareId.value = id;
	linkDiv.classList.add('hidden');
	modal.showModal();
}
function closeShareModal() {
	creatingText.classList.add('hidden');
	shareError.classList.add('hidden');
	linkDiv.classList.add('hidden');
	modal.close();
}
shareForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	creatingText.classList.remove('hidden');
	const formData = new FormData(shareForm);
	const dataObject = Object.fromEntries(formData.entries());

	try {
		const response = await fetch('/share/create-link', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify(dataObject),
		});
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}
		json = await response.json();
		shareLink.value = window.location.host + `/share/${json.url}`;
		linkDiv.classList.remove('hidden');
	} catch (error) {
		creatingText.classList.add('hidden');
		shareError.textContent = error;
		shareError.classList.remove('hidden');
	}
});

function copyLink() {
	navigator.clipboard.writeText(shareLink.value);
}
