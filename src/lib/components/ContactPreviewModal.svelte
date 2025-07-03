<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import {
        X,
        Mail,
        User,
        Calendar,
        DollarSign,
        Briefcase,
        MessageSquare,
        Copy,
        Send,
        Trash2,
        Loader,
        Paperclip,
        FileText,
        Image,
        File,
        Download
    } from 'lucide-svelte';
    import { CONTACT_STATUSES, STATUS_OPTIONS, type ContactStatus } from '$lib/types/contact';

    export let isOpen = false;
    export let contact: any = null;

    const dispatch = createEventDispatcher();

    let selectedStatus: string = '';
    let replyText = '';
    let replySubject = '';
    let isReplying = false;
    let attachmentFiles: FileList | null = null;
    let fileInput: HTMLInputElement;

    $: if (contact) {
        selectedStatus = contact.status;
        replySubject = `Re: ${contact.projectType} Project Inquiry`;
        replyText = `Hi ${contact.name},

Thank you for reaching out regarding your ${contact.projectType} project. I've reviewed your requirements and I'm excited to discuss how I can help bring your vision to life.

Based on your project needs:
"${contact.needs}"

I'd love to schedule a call to discuss your project in more detail and provide you with a customized proposal.

Best regards,
[Your Name]`;
    }

    function closeModal() {
        isOpen = false;
        dispatch('close');
    }

    function handleStatusUpdate() {
        dispatch('statusUpdate', { status: selectedStatus });
        closeModal();
    }

    function copyEmail() {
        navigator.clipboard.writeText(contact.email);
    }

    function copyReply() {
        navigator.clipboard.writeText(replyText);
    }

    function openEmailClient() {
        const subject = encodeURIComponent(replySubject);
        const body = encodeURIComponent(replyText);
        window.open(`mailto:${contact.email}?subject=${subject}&body=${body}`);
    }

    function handleFileSelect() {
        fileInput.click();
    }

    function removeAttachment(index: number) {
        if (attachmentFiles) {
            const dt = new DataTransfer();
            for (let i = 0; i < attachmentFiles.length; i++) {
                if (i !== index) {
                    dt.items.add(attachmentFiles[i]);
                }
            }
            attachmentFiles = dt.files;
            fileInput.files = dt.files;
        }
    }

    function getFileIcon(filename: string) {
        const ext = filename.toLowerCase().split('.').pop();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
            return Image;
        } else if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
            return FileText;
        }
        return File;
    }

    function formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async function sendReply() {
        if (!replyText.trim() || !replySubject.trim()) {
            alert('Please fill in both subject and message');
            return;
        }

        isReplying = true;

        try {
            const formData = new FormData();
            formData.append('contactId', contact.id.toString());
            formData.append('contactEmail', contact.email);
            formData.append('contactName', contact.name);
            formData.append('subject', replySubject);
            formData.append('message', replyText);

            // Add attachments
            if (attachmentFiles) {
                for (let i = 0; i < attachmentFiles.length; i++) {
                    formData.append('attachments', attachmentFiles[i]);
                }
            }

            const response = await fetch('?/sendReply', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                alert('Reply sent successfully!');

                // Clear attachments
                attachmentFiles = null;
                if (fileInput) {
                    fileInput.value = '';
                }

                if (contact.status === 'new') {
                    selectedStatus = 'contacted';
                    handleStatusUpdate();
                } else {
                    closeModal();
                }
            } else {
                const result = await response.json();
                alert(`Failed to send reply: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('An error occurred while sending the reply');
        } finally {
            isReplying = false;
        }
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

    function getStatusConfig(status: ContactStatus) {
        return CONTACT_STATUSES[status] || CONTACT_STATUSES.new;
    }

    $: statusConfig = contact ? getStatusConfig(contact.status) : null;
</script>

{#if isOpen && contact}
    <div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
        <div class="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-gray-200 p-6">
                <div class="flex items-center space-x-3">
                    <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <User class="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 class="text-xl font-semibold text-gray-900">{contact.name}</h2>
                        <p class="text-gray-600">{contact.email}</p>
                    </div>
                </div>

                <div class="flex items-center space-x-3">
                    {#if statusConfig}
                        <div class="flex items-center space-x-2 rounded-full px-3 py-1 {statusConfig.color}">
                            <svelte:component this={statusConfig.icon} class="h-4 w-4" />
                            <span class="text-sm font-medium">{statusConfig.label}</span>
                        </div>
                    {/if}
                    <button
                        on:click={closeModal}
                        class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X class="h-5 w-5" />
                    </button>
                </div>
            </div>

            <!-- Content -->
            <div class="max-h-[calc(90vh-140px)] overflow-y-auto">
                <div class="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
                    <!-- Contact Details -->
                    <div class="space-y-6">
                        <div>
                            <h3 class="mb-4 text-lg font-semibold text-gray-900">Contact Information</h3>
                            <div class="space-y-3">
                                <div class="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                    <div class="flex items-center space-x-3">
                                        <Mail class="h-4 w-4 text-gray-500" />
                                        <span class="text-sm text-gray-900">{contact.email}</span>
                                    </div>
                                    <button
                                        on:click={copyEmail}
                                        class="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                                        title="Copy email"
                                    >
                                        <Copy class="h-4 w-4" />
                                    </button>
                                </div>

                                <div class="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                                    <Calendar class="h-4 w-4 text-gray-500" />
                                    <span class="text-sm text-gray-900"
                                        >Submitted: {formatDate(contact.createdAt)}</span
                                    >
                                </div>
                            </div>
                        </div>

                        <!-- Project Details -->
                        <div>
                            <h3 class="mb-4 text-lg font-semibold text-gray-900">Project Details</h3>
                            <div class="space-y-3">
                                <div class="rounded-lg bg-gray-50 p-3">
                                    <div class="mb-1 flex items-center space-x-2">
                                        <Briefcase class="h-4 w-4 text-gray-500" />
                                        <span class="text-sm font-medium text-gray-700">Project Type</span>
                                    </div>
                                    <p class="text-sm text-gray-900">{contact.projectType}</p>
                                </div>

                                <div class="rounded-lg bg-gray-50 p-3">
                                    <div class="mb-2 flex items-center space-x-2">
                                        <MessageSquare class="h-4 w-4 text-gray-500" />
                                        œ<span class="text-sm font-medium text-gray-700">Project Needs</span>
                                    </div>
                                    <p class="text-sm leading-relaxed text-gray-900">{contact.needs}</p>
                                </div>

                                <div class="rounded-lg bg-gray-50 p-3">
                                    <div class="mb-1 flex items-center space-x-2">
                                        <DollarSign class="h-4 w-4 text-gray-500" />
                                        <span class="text-sm font-medium text-gray-700">Budget</span>
                                    </div>
                                    <p class="text-sm text-gray-900">{getBudgetDisplay(contact.budget)}</p>
                                </div>

                                <div class="rounded-lg bg-gray-50 p-3">
                                    <div class="mb-2 flex items-center space-x-2">
                                        <MessageSquare class="h-4 w-4 text-gray-500" />
                                        <span class="text-sm font-medium text-gray-700">Project Description</span>
                                    </div>
                                    <p class="text-sm leading-relaxed text-gray-900">{contact.additional}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Status Update -->
                        <div>
                            <h3 class="mb-4 text-lg font-semibold text-gray-900">Update Status</h3>
                            <div class="space-y-3">
                                <select
                                    bind:value={selectedStatus}
                                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                >
                                    {#each STATUS_OPTIONS as option}
                                        <option value={option.value}>{option.label}</option>
                                    {/each}
                                </select>

                                {#if selectedStatus !== contact.status}
                                    <button
                                        on:click={handleStatusUpdate}
                                        class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                                    >
                                        Update Status
                                    </button>
                                {/if}
                            </div>
                        </div>
                    </div>

                    <!-- Reply Section -->
                    <div class="space-y-6">
                        <div>
                            <h3 class="mb-4 text-lg font-semibold text-gray-900">Send Reply</h3>
                            <div class="space-y-3">
                                <!-- Subject -->
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-gray-700">Subject</label>
                                    <input
                                        type="text"
                                        bind:value={replySubject}
                                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                        placeholder="Email subject..."
                                    />
                                </div>

                                <!-- Message -->
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-gray-700">Message</label>
                                    <textarea
                                        bind:value={replyText}
                                        rows="8"
                                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                        placeholder="Write your reply..."
                                    ></textarea>
                                </div>

                                <!-- Attachments -->
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-gray-700">Attachments</label>
                                    <input
                                        type="file"
                                        bind:this={fileInput}
                                        bind:files={attachmentFiles}
                                        multiple
                                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                                        class="hidden"
                                    />
                                    
                                    <button
                                        type="button"
                                        on:click={handleFileSelect}
                                        class="flex w-full items-center justify-center rounded-lg border border-dashed border-gray-300 px-3 py-4 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700"
                                    >
                                        <Paperclip class="mr-2 h-4 w-4" />
                                        Click to attach files
                                    </button>

                                    {#if attachmentFiles && attachmentFiles.length > 0}
                                        <div class="mt-2 space-y-2">
                                            {#each Array.from(attachmentFiles) as file, index}
                                                <div class="flex items-center justify-between rounded-lg bg-gray-50 p-2">
                                                    <div class="flex items-center space-x-2">
                                                        <svelte:component this={getFileIcon(file.name)} class="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <div class="text-sm text-gray-900">{file.name}</div>
                                                            <div class="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        on:click={() => removeAttachment(index)}
                                                        class="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-red-600"
                                                        title="Remove attachment"
                                                    >
                                                        <X class="h-3 w-3" />
                                                    </button>
                                                </div>
                                            {/each}
                                        </div>
                                    {/if}
                                </div>

                                <!-- Action Buttons -->
                                <div class="flex space-x-2">
                                    <button
                                        on:click={sendReply}
                                        disabled={isReplying || !replyText.trim() || !replySubject.trim()}
                                        class="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {#if isReplying}
                                            <Loader class="h-4 w-4 animate-spin" />
                                            <span>Sending...</span>
                                        {:else}
                                            <Send class="h-4 w-4" />
                                            <span>Send Reply</span>
                                        {/if}
                                    </button>

                                    <button
                                        on:click={openEmailClient}
                                        class="flex items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                                    >
                                        <Mail class="h-4 w-4" />
                                        <span>Email App</span>
                                    </button>

                                    <button
                                        on:click={copyReply}
                                        class="flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                                        title="Copy reply text"
                                    >
                                        <Copy class="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Additional Actions -->
                        <div>
                            <h3 class="mb-4 text-lg font-semibold text-gray-900">Actions</h3>
                            <div class="space-y-2">
                                <button
                                    class="flex w-full items-center space-x-2 rounded-lg border border-red-300 px-4 py-2 text-red-700 transition-colors hover:bg-red-50"
                                >
                                    <Trash2 class="h-4 w-4" />
                                    <span>Delete Contact</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}
