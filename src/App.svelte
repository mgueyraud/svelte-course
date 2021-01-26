<script>
    import meetups from "./Meetups/meetups-store";
    import { flip } from "svelte/animate";
    import { scale } from "svelte/transition";
    import EditMeetup   from "./Meetups/EditMeetup.svelte";
    import MeetupGrid   from "./Meetups/MeetupGrid.svelte";
    import MeetupItem   from "./Meetups/MeetupItem.svelte";
    import Button       from "./UI/Button.svelte";
    import Header       from "./UI/Header.svelte";
    import MeetupDetail from "./Meetups/MeetupDetail.svelte";
    import MeetupFilter from "./Meetups/MeetupFilter.svelte";
    import LoadingSpinner from "./UI/LoadingSpinner.svelte";
    import Error from "./UI/Error.svelte";

    
    let editMode = null;
    let page = "overview";
    let pageData = {};
    let favOnlys = false;
    let isLoading = true;
    let error;

    $: filteredMeetups = favOnlys ? $meetups.filter(m => m.isFavorite) : $meetups;

    fetch('https://svelte-course-45e6f-default-rtdb.firebaseio.com/meetups.json')
    .then(res => {
        if(!res.ok){
            throw new Error('Fallo hijo de tptm');
        }
        return res.json();
    })
    .then(data => {
        const loadedMeetups = [];
        for(const key in data){
            loadedMeetups.push({
                ...data[key],
                id: key
            });
        }
        meetups.setMeetups(loadedMeetups.reverse());
        isLoading = false;
    })
    .catch(err => {
        error = err;
        isLoading = false;
        console.log(err)
    });

    function handleSubmit(event){
        editMode = null;
    }

    function cancelEdit(){
        editMode = null;
        pageData = {};
    }

    function showDetails(event){
        page = "details";
        pageData.id = event.detail;
    }

    function closeDetails(){
        page = "overview";
        pageData = {};
    }

    function handleEdit(event){
        editMode = "edit";
        pageData.id = event.detail;
    }

    function setFilter(event){
        favOnlys = event.detail === 1;
    }

    function handleCancelError(){
        error = null;
    }
</script>

<style>
    main{
        margin-top: 5rem;
    }

    .meetup-controls{
        margin: 1rem;
    }
    .no-meetups{
        margin: 1rem;
    }
</style>

{#if error}
    <Error message={error.message} on:cancel={handleCancelError} />
{/if}

<Header />
<main>
    {#if page === "overview"}
        <div class="meetup-controls">
            <Button on:click={() => editMode="edit"} >New Meetup</Button>
            <div>&nbsp;</div>
            <MeetupFilter on:select={setFilter} />
        </div>
        {#if editMode === "edit"}
            <EditMeetup id={pageData.id} on:save={handleSubmit} on:cancel={cancelEdit}/>
        {/if}
        {#if isLoading}
            <LoadingSpinner />
        {:else}
            {#if filteredMeetups.length === 0}
                <p class="no-meetups">No meetups found, start adding someone</p>
            {/if}
            <MeetupGrid>
                {#each filteredMeetups as meetup (meetup.id)}
                    <div animate:flip={{duration:300}} transition:scale>
                        <MeetupItem 
                            id={meetup.id}
                            title={meetup.title}
                            subtitle={meetup.subtitle}
                            description={meetup.description}
                            imageUrl={meetup.imageUrl}
                            address={meetup.address}
                            contactEmail={meetup.contactEmail}
                            isFavorite={meetup.isFavorite}
                            on:showdetails={showDetails}
                            on:edit={handleEdit}
                        />
                    </div>
                {/each}
            </MeetupGrid>
        {/if}
    {:else}
        <MeetupDetail id={pageData.id} on:close={closeDetails}></MeetupDetail>
    {/if}
</main>