import {createInscription, deleteInscriptionById, fetchAllInscriptions, fetchInscriptionById, fetchRecentInscriptions, searchInscriptionsByTeam,searchTeamsByName,updateInscription} from "./api/inscription-api"
import {InscriptionForm} from "./components/InscriptionForm"
import {InscriptionList} from "./components/InscriptionList"
import {InscriptionSearch} from "./components/InscriptionSearch"
import {PaginationControls} from "./components/PaginationControls"
import {InscriptionManagementPage} from "./components/InscriptionManagment"
import {TeamSearch} from "./components/TeamSearch"


import {InscriptionCreateSchema,InscriptionEditSchema} from "./schemas/inscription-schema"
import {InscriptionInfoRecord, InscriptionValidationErrors,TeamSummaryRecord} from "./types/inscription-types"

import {useInscriptionForm, useInscriptionMutations,useInscriptions,usePaginatedInscriptions,useRecentInscriptions,useTeamSearch} from "./hooks/inscription-hooks"


export {
    InscriptionForm,
    InscriptionList,
    InscriptionSearch,
    PaginationControls,
    TeamSearch,
    InscriptionManagementPage,
    createInscription,
    deleteInscriptionById,
    fetchAllInscriptions,
    fetchInscriptionById,
    fetchRecentInscriptions,
    searchInscriptionsByTeam,
    searchTeamsByName,
    updateInscription,
    useInscriptionForm,
    useInscriptionMutations,
    useInscriptions,
    usePaginatedInscriptions,
    useRecentInscriptions,
    useTeamSearch,
    InscriptionCreateSchema,
    InscriptionEditSchema
}
export type {
    InscriptionInfoRecord,
    InscriptionValidationErrors,
    TeamSummaryRecord
}

