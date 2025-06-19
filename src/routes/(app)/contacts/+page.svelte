<script lang="ts">
    import { goto } from '$app/navigation';
    import { enhance } from '$app/forms';
    import {
        Plus,
        Search,
        Filter,
        Mail,
        User,
        Calendar,
        Eye,
        Trash2,
        DollarSign,
        Briefcase,
        MessageSquare,
        Clock,
        CheckCircle,
        AlertCircle,
        Archive,
        Phone,
        Video,
        FileText,
        XCircle,
        Pause,
        Star
    } from 'lucide-svelte';
    import ContactPreviewModal from '$lib/components/ContactPreviewModal.svelte';
    import SearchAndFilter from '$lib/components/ui/SearchAndFilter.svelte';
    import Card from '$lib/components/ui/Card.svelte';
    import { CONTACT_STATUSES, FILTER_OPTIONS, STATUS_OPTIONS, type ContactStatus } from '$lib/types/contact';

    export let data;
    export let form;

    let searchQuery = '';
    let selectedFilter = 'all';
    let selectedStatus = 'all';
    let sortBy = 'newest';
    let showPreviewModal = false;
    let selectedContact: any = null;

    const statusOptionsWithAll = [
        { value: 'all', label: 'All Status' },
        ...STATUS_OPTIONS
    ];

    $: filteredContacts = data.contacts.filter((contact) => {
        const matchesSearch =
            !searchQuery ||
            contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.needs.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.projectType.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = selectedFilter === 'all' || contact.status === selectedFilter;

        return matchesSearch && matchesStatus;
    });

    $: sortedContacts = [...filteredContacts].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'oldest':
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'name':
                return a.name.localeCompare(b.name);
            case 'status':
                return a.status.localeCompare(b.status);
            default:
                return 0;
        }
    });

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function formatTime(date: string) {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getStatusConfig(status: ContactStatus) {
        return CONTACT_STATUSES[status] || CONTACT_STATUSES.new;
    }

    function getBudgetDisplay(budget: string) {
        const budgetMap: Record<string, string> = {
            'under-5k': 'Under $5,000',
            '5k-15k': '$5,000 - $15,000',
            '15k-50k': '$15,000 - $50,000',
            'over-50k': 'Over $50,000',
            discuss: "Let's discuss"
        };
        return budgetMap[budget] || budget;
    }

    function previewContact(contact: any) {
        selectedContact = contact;
        showPreviewModal = true;
    }

    async function deleteContact(contact: any) {
        const confirmed = confirm(
            `Are you sure you want to delete the contact message from "${contact.name}" (${contact.email})?\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            const formData = new FormData();
            formData.append('id', contact.id.toString());

            const response = await fetch('?/delete', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Contact deleted successfully!');
                location.reload();
            } else {
                alert('Failed to delete contact. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
            alert('An error occurred while deleting the contact.');
        }
    }

    function updateStatus(contactId: number, newStatus: string) {
        const formData = new FormData();
        formData.append('contactId', contactId.toString());
        formData.append('status', newStatus);

        fetch('?/updateStatus', {
            method: 'POST',
            body: formData
        }).then(() => {
            window.location.reload();
        });
    }


    $: priorityContacts = data.contacts.filter(c => 
        c.status === 'new' || 
        c.status === 'meeting-scheduled' || 
        c.budget === 'over-50k'
    );
</script>

<svelte:head>
    <title>Contacts - Admin</title>
</svelte:head>

<div class="space-y-6">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="flex items-center text-2xl font-bold text-gray-900">
                <Mail class="mr-3 h-6 w-6 text-blue-600" />
                Contact Messages
            </h1>
            <p class="mt-1 text-gray-600">Manage and respond to contact form submissions</p>
        </div>

        {#if priorityContacts.length > 0}
            <div class="flex items-center space-x-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                <Star class="h-4 w-4 text-amber-600" />
                <span class="text-sm text-amber-800">
                    {priorityContacts.length} priority contact{priorityContacts.length !== 1 ? 's' : ''}
                </span>
            </div>
        {/if}
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-6">
        <div class="rounded-lg border border-gray-200 bg-white p-4">
            <div class="text-2xl font-bold text-blue-600">
                {data.contacts.filter((c) => c.status === 'new').length}
            </div>
            <div class="text-sm text-gray-600">New</div>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4">
            <div class="text-2xl font-bold text-yellow-600">
                {data.contacts.filter((c) => ['contacted', 'in-progress', 'meeting-scheduled', 'proposal-sent', 'negotiating'].includes(c.status)).length}
            </div>
            <div class="text-sm text-gray-600">Active</div>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4">
            <div class="text-2xl font-bold text-green-600">
                {data.contacts.filter((c) => c.status === 'completed').length}
            </div>
            <div class="text-sm text-gray-600">Completed</div>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4">
            <div class="text-2xl font-bold text-red-600">
                {data.contacts.filter((c) => c.status === 'rejected').length}
            </div>
            <div class="text-sm text-gray-600">Rejected</div>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4">
            <div class="text-2xl font-bold text-gray-600">
                {data.contacts.filter((c) => ['on-hold', 'archived'].includes(c.status)).length}
            </div>
            <div class="text-sm text-gray-600">Inactive</div>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4">
            <div class="text-2xl font-bold text-purple-600">
                {data.contacts.length}
            </div>
            <div class="text-sm text-gray-600">Total</div>
        </div>
    </div>

    <SearchAndFilter
        bind:searchQuery
        placeholder="Search contacts..."
        filterOptions={FILTER_OPTIONS}
        bind:selectedFilter
    />

    <Card padding="p-4">
        <div class="flex flex-col gap-4 sm:flex-row">
            <div class="flex-1">
                <select
                    bind:value={selectedStatus}
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                    {#each statusOptionsWithAll as option}
                        <option value={option.value}>{option.label}</option>
                    {/each}
                </select>
            </div>

            <div>
                <select
                    bind:value={sortBy}
                    class="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name A-Z</option>
                    <option value="status">Status</option>
                </select>
            </div>
        </div>
    </Card>

    <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {#if sortedContacts.length === 0}
            <div class="p-12 text-center">
                <Mail class="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 class="mb-2 text-lg font-medium text-gray-900">
                    {searchQuery || selectedFilter !== 'all'
                        ? 'No contacts found'
                        : 'No contact messages yet'}
                </h3>
                <p class="text-gray-600">
                    {searchQuery || selectedFilter !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Contact messages will appear here when visitors submit the contact form'}
                </p>
            </div>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Contact
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Project Details
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Budget
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Status
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Date
                            </th>
                            <th class="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                        {#each sortedContacts as contact}
                            {@const statusConfig = getStatusConfig(contact.status)}
                            <tr class="hover:bg-gray-50 {contact.status === 'new' ? 'bg-blue-50/30' : ''}">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <div class="h-10 w-10 flex-shrink-0">
                                            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                                                <User class="h-5 w-5 text-gray-600" />
                                            </div>
                                        </div>
                                        <div class="ml-4">
                                            <div class="flex items-center space-x-2">
                                                <div class="text-sm font-medium text-gray-900">
                                                    {contact.name}
                                                </div>
                                                {#if contact.status === 'new'}
                                                    <span class="h-2 w-2 rounded-full bg-blue-500"></span>
                                                {/if}
                                                {#if contact.budget === 'over-50k'}
                                                    <Star class="h-3 w-3 text-amber-500" />
                                                {/if}
                                            </div>
                                            <div class="text-sm text-gray-500">
                                                {contact.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td class="px-6 py-4">
                                    <div class="text-sm text-gray-900">
                                        <div class="font-medium">{contact.projectType}</div>
                                        <div class="line-clamp-2 text-gray-500">{contact.needs}</div>
                                    </div>
                                </td>

                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center text-sm text-gray-900">
                                        <DollarSign class="mr-1 h-4 w-4 text-green-600" />
                                        {getBudgetDisplay(contact.budget)}
                                    </div>
                                </td>

                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center space-x-2">
                                        <svelte:component 
                                            this={statusConfig.icon} 
                                            class="h-3 w-3" 
                                        />
                                        <select
                                            value={contact.status}
                                            on:change={(e) => updateStatus(contact.id, e.target.value)}
                                            class="rounded-lg border px-2 py-1 text-xs {statusConfig.color} focus:ring-2 focus:ring-blue-500 font-medium"
                                        >
                                            {#each STATUS_OPTIONS as option}
                                                <option value={option.value}>{option.label}</option>
                                            {/each}
                                        </select>
                                    </div>
                                </td>

                                <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                    <div class="flex items-center">
                                        <Calendar class="mr-1 h-4 w-4" />
                                        <div>
                                            <div>{formatDate(contact.createdAt)}</div>
                                            <div class="text-xs">{formatTime(contact.createdAt)}</div>
                                        </div>
                                    </div>
                                </td>

                                <td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                    <div class="flex justify-end space-x-2">
                                        <button
                                            on:click={() => previewContact(contact)}
                                            class="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                            title="Preview"
                                        >
                                            <Eye class="h-4 w-4" />
                                        </button>
                                        
                                        <button
                                            on:click={() => deleteContact(contact)}
                                            class="rounded-lg p-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            title="Delete"
                                        >
                                            <Trash2 class="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </div>
</div>

{#if showPreviewModal && selectedContact}
    <ContactPreviewModal
        bind:isOpen={showPreviewModal}
        contact={selectedContact}
        user={data.user}
        on:close={() => {
            showPreviewModal = false;
            selectedContact = null;
        }}
        on:statusUpdate={(e) => updateStatus(selectedContact.id, e.detail.status)}
    />
{/if}

{#if form?.success}
    <div class="fixed right-4 bottom-4 rounded-lg border border-green-200 bg-green-50 p-4 shadow-lg">
        <p class="text-sm text-green-600">✅ {form.message}</p>
    </div>
{/if}

{#if form?.error}
    <div class="fixed right-4 bottom-4 rounded-lg border border-red-200 bg-red-50 p-4 shadow-lg">
        <p class="text-sm text-red-600">❌ {form.error}</p>
    </div>
{/if}
