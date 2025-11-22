"use client"

import { GetModeratorMeetings, GetModeratorMeetingsYears } from "@/actions/meeting"
import { clientAuth } from "@/hooks/auth"
import { formatedDate } from "@/utils/date"
import { ModeratorQueries } from "@/utils/query"
import { Chip, Pagination, PaginationItemRenderProps, PaginationItemType, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react"
import { Circle, MeetingStatus } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { EditMeetingModal } from "../edit-meeting-modal"
import { CompleteMeetingModal } from "../complete-meeting-modal"
import { CreateMeetingModal } from "../members/create-meeting-modal"
import { useState } from "react"
//import MeetingParticipantsModal from "../meeting-participants-modal"

const StatusChip = ({ status }: { status: MeetingStatus }) => {
  let color: "primary" | "success" | "danger" | "warning" | "default" = "default";
  let message: string = status;

  switch (status) {
      case MeetingStatus.Scheduled:
          color = "primary";
          message = "Planowane";
          break;
      case MeetingStatus.Completed:
          color = "success";
          message = "Zakończone";
          break;
  }

  return <Chip color={color} variant="dot">{message}</Chip>;
};

export const MeetingsTable = ({
    circle
} : {
    circle?: Circle
}) => {
    const moderator = clientAuth()

    const [selectedYearIndex, setSelectedYearIndex] = useState(0); // 0 = najnowszy rok

    const { data: years } = useQuery({
        queryKey: [ModeratorQueries.MeetingsYears, moderator?.id],
        queryFn: () => GetModeratorMeetingsYears(moderator!.id),
        enabled: !!moderator
    })

    const { data: meetings, isLoading } = useQuery({
        queryKey: [ModeratorQueries.Meetings, moderator?.id, years?.[selectedYearIndex]],
        queryFn: () => GetModeratorMeetings(moderator!.id, undefined, years?.[selectedYearIndex]),
        enabled: !!moderator && !!years?.[selectedYearIndex]
    })

    const renderItem = (props: PaginationItemRenderProps) => {
        const { value, ref, key, isActive, setPage, onNext, onPrevious, className } = props;
      
        if (value === PaginationItemType.NEXT) {
          return <button ref={ref} key={key} className={className} onClick={onNext}>&gt;</button>;
        }
        if (value === PaginationItemType.PREV) {
          return <button ref={ref} key={key} className={className} onClick={onPrevious}>&lt;</button>;
        }
        if (value === PaginationItemType.DOTS) {
          return <button ref={ref} key={key} className={className}>...</button>;
        }
      
        const label = typeof value === "number" && years ? String(years[value - 1]) : value;
        const activeClasses = isActive ? "bg-primary text-primary-foreground" : "";
     
        return (
          <button
            ref={ref}
            key={key}
            //className={className}
            className={`${className} ${activeClasses}`}

            onClick={() => setPage(value)}
          >
            {label}
          </button>
        );
      };

    const filteredMeetings = (meetings ?? []).filter(
      m => !circle || m.circle.id === circle.id
    );

    return <main>
        <div className="flex space-x-4 items-center">
            <h6 className="w-full">Spotkania</h6>
            <CreateMeetingModal circle={circle}/>
        </div>
        {/* <pre>
            {JSON.stringify(years,null,2)} <br/>
            SelectedYearIndex {selectedYearIndex} <br/>
            Year {years && years[selectedYearIndex]}
        </pre> */}
        <Table 
          shadow="sm"
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                total={years?.length ?? 0}
                page={selectedYearIndex + 1}
                onChange={(page) => setSelectedYearIndex(page - 1)}
                disableCursorAnimation 
                renderItem={renderItem}
              />
            </div>
          }    
        >
            <TableHeader>
                <TableColumn>Data</TableColumn>
                <TableColumn>Krąg</TableColumn>
                {/* <TableColumn>Ulica</TableColumn> */}
                {/* <TableColumn>Miasto</TableColumn> */}
                <TableColumn>Status</TableColumn>
                <TableColumn align="center">Akcje</TableColumn>
            </TableHeader>
            <TableBody
                items={filteredMeetings}
                isLoading={isLoading}
                loadingContent={<Spinner label="Ładowanie danych" variant="wave"/>}
                emptyContent={"Brak zakończonych spotkań"}
            >
                {(item) => (
                    <TableRow key={item.id}>
                        <TableCell>{formatedDate(item.startTime, item.endTime)}</TableCell>
                        <TableCell>{item.circle.name}</TableCell>
                        {/* <TableCell>{item.street}</TableCell> */}
                        {/* <TableCell>{item.city.name}</TableCell> */}
                        <TableCell align="center"><StatusChip status={item.status}/></TableCell>
                        <TableCell className="flex justify-center">
                          123
                          {/* {item.status === MeetingStatus.Scheduled && <>
                            <EditMeetingModal
                              meeting={item}
                              circle={item.circle}
                              country={item.city.region.country}
                            />
                            <CompleteMeetingModal
                              meeting={item}
                              circle={item.circle}
                            />
                          </>}
                          <MeetingParticipantsModal
                            meeting={item}
                            circle={item.circle}
                            country={item.city.region.country}
                          /> */}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </main>
}
