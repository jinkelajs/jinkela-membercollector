type DepartmentMember = {
  id: number,
  directorId: number,
  name: string,
}

type Department = {
  id: number,
  parentId: number,
  name: string,
  members: DepartmentMember[],
}

declare class MemberCollector {

  constructor(args: { data: Department[], disabled?: boolean })

}
